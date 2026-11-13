// Signups that live in CiviCRM alone: PauseaiMemberIntake.submit and verify for a signup key,
// called with the intake API account's key (crmIntake.ts). The contract is pauseai-civicrm's
// docs/intake-endpoint-plan.md, "Signup keys".
//
// Unlike a Members row's report (crmIntake.ts), nothing else keeps a copy of such a signup, so
// the form awaits the call, retries what may be transient, and tells the person when it could
// not confirm the signup was saved.
//
// Emails and other submitted values must never reach a log or a report: only the key does.
import { env } from '$env/dynamic/private'
import type { WrittenRecord } from '$lib/airtable'
import {
	afterResponse,
	callCrm,
	failureDetails,
	isPlainServerError,
	isTransient,
	reportCrmProblem,
	verifyLinkInCrm,
	wait,
	type CrmFailure,
	type CrmVerifyResult
} from '$lib/server/crmIntake'

export type MemberBackend = 'airtable' | 'civicrm'

/**
 * Where a NEW signup is written: "civicrm" makes it a signup key's, anything else an Airtable
 * row's. A post continuing a signup goes where its id says (isSignupKey), whatever this says, so
 * flipping it back leaves signups in progress working.
 */
export const memberBackend = (): MemberBackend =>
	env.MEMBER_BACKEND === 'civicrm' ? 'civicrm' : 'airtable'

const SIGNUP_KEY = /^mem[A-Za-z0-9]{22}$/
const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export const isSignupKey = (value: unknown): value is string =>
	typeof value === 'string' && SIGNUP_KEY.test(value)

/** A new signup key, about 130 random bits. Base62, as /api/verify takes only alphanumeric keys. */
export function mintSignupKey(): string {
	let key = 'mem'
	while (key.length < 25) {
		const [byte] = crypto.getRandomValues(new Uint8Array(1))
		// 248 = 4 * 62: rejecting the rest keeps every character equally likely.
		if (byte < 248) key += BASE62[byte % 62]
	}
	return key
}

// Above CiviCRM's wait for a key's lock (5 s, MemberIntake::LOCK_WAIT_SECONDS) plus a normal
// answer (about 2 s), so a call queued behind a running one is not cut off; short enough that an
// outage of hanging calls still leaves a retry after it, since a retry repeats the same write.
const ATTEMPT_TIMEOUT_MS = 7_500
// A retry starts only if this much of the deadline is left: comfortably above how long CiviCRM
// takes to answer a signup at production latency (1.5 to 2 s), so the attempt can finish.
const MIN_ATTEMPT_MS = 4_000
// When retries start, counted from the first attempt, or at once if the attempt before ran
// past its time. An outage as long as a deploy's swap (about 14 s) is outlasted whether its
// calls fail at once (attempts near 0, 1, 3, 7 and 15 s) or hang (near 0, 7.5 and 15 s).
const RETRY_AT_MS = [1_000, 3_000, 7_000, 15_000]

/** As crmIntake.ts names an intake outcome; `error:memberships` means the contact is written. */
type Outcome = 'ok' | 'error' | 'error:memberships' | `refused:${string}`

/** What the form does about a signup call. */
export type SignupResult =
	'saved' | 'chapter_answer_missing' | 'session_expired' | 'row_gone' | 'not_saved'

// CiviCRM's refusals for a signup whose contact is gone or was never a member's.
const ROW_GONE = ['merged', 'erased', 'trashed', 'not_a_member']
// Every refusal code the contract names. Another reason is reported as `refused:unknown`, never
// as sent, since only these are known to carry nothing the request did.
const REFUSALS = new Set([
	...ROW_GONE,
	'chapter_answer_missing',
	'invalid_record',
	'token_required',
	'token_invalid',
	'token_expired',
	'token_unverifiable'
])

function resultOf(outcome: Outcome): SignupResult {
	if (outcome === 'ok' || outcome === 'error:memberships') return 'saved'
	if (outcome === 'refused:chapter_answer_missing') return 'chapter_answer_missing'
	// A checked token can run out while retries wait; any other token refusal is the secrets
	// disagreeing, which the person cannot fix.
	if (outcome === 'refused:token_expired') return 'session_expired'
	if (ROW_GONE.some((reason) => outcome === `refused:${reason}`)) return 'row_gone'
	return 'not_saved'
}

type Attempt = { outcome: Outcome; failure?: CrmFailure; locked?: true }

async function attempt(params: unknown, timeoutMs: number): Promise<Attempt> {
	const answer = await callCrm('PauseaiMemberIntake/submit', params, timeoutMs)
	if (!answer.ok) return { outcome: 'error', failure: answer }
	const { status, reason } = answer.row
	if (status === 'ok') return { outcome: 'ok' }
	if (status === 'refused') {
		return { outcome: `refused:${REFUSALS.has(String(reason)) ? String(reason) : 'unknown'}` }
	}
	if (status === 'error' && reason === 'memberships') return { outcome: 'error:memberships' }
	// Another call for this key held its lock for CiviCRM's whole wait; this one wrote nothing.
	if (status === 'error' && reason === 'locked') return { outcome: 'error', locked: true }
	return { outcome: 'error' }
}

/**
 * Submits a signup key's record, awaited, retrying with the same key, token and record while the
 * failure may be transient and `deadline` (a Date.now() time) leaves a retry time to finish.
 * Network errors, timeouts, 502 to 504, Cloudflare's 52x and a busy key are retried on the
 * schedule; a plain 500 once. `token` must be one this server minted or has just checked. Every outcome but `ok` is reported to Sentry with the
 * key alone, as an error when the signup or its lists were not saved (the alert rule's) and as
 * a warning otherwise, after the response when there is a platform. Never rejects.
 */
export async function submitSignup(
	record: WrittenRecord,
	token: string,
	deadline: number,
	platform?: App.Platform
): Promise<SignupResult> {
	const params = { record, token }
	const first = Date.now()
	let outcome: Outcome = 'error'
	let details: Record<string, unknown> = { cause: 'deadline' }
	let plainServerErrors = 0
	for (const [index, at] of [0, ...RETRY_AT_MS].entries()) {
		if (at) {
			// The CRM already waited out the lock, so the retry needs no more.
			const startAt = details.cause === 'locked' ? Date.now() : Math.max(Date.now(), first + at)
			if (deadline - startAt < MIN_ATTEMPT_MS) break
			console.warn('[crm-signup] submit failed, retrying', details)
			await wait(startAt - Date.now())
		}
		const remaining = deadline - Date.now()
		if (remaining <= 0) break
		// A slow CRM still writes after an abort; when no retry could follow a timeout (no time or
		// no slot left), waiting out the answer beats telling the person it failed and having
		// them sign up again.
		const lastChance =
			index === RETRY_AT_MS.length || remaining - ATTEMPT_TIMEOUT_MS < MIN_ATTEMPT_MS
		const step = await attempt(params, lastChance ? remaining : ATTEMPT_TIMEOUT_MS)
		outcome = step.outcome
		details = step.failure ? failureDetails(step.failure) : step.locked ? { cause: 'locked' } : {}
		const retry =
			step.locked ||
			(step.failure !== undefined &&
				(isTransient(step.failure) ||
					(isPlainServerError(step.failure) && ++plainServerErrors === 1)))
		if (!retry) break
	}
	const result = resultOf(outcome)
	if (outcome !== 'ok') {
		await afterResponse(
			platform,
			reportCrmProblem(
				`CRM signup ${outcome}`,
				{ check: 'crm-signup', recordId: record.id, outcome, ...details },
				{
					fingerprint: ['crm-signup', outcome],
					level: result === 'not_saved' || outcome === 'error:memberships' ? 'error' : 'warning'
				}
			)
		)
	}
	return result
}

/** Checks a signup key's verification link, which CiviCRM judges alone. Never rejects. */
export const verifySignupInCrm = (key: string, token: string): Promise<CrmVerifyResult> =>
	verifyLinkInCrm('PauseaiMemberIntake/verify', key, token, (details) =>
		reportCrmProblem(
			'CRM signup verify error',
			{ check: 'crm-signup', action: 'verify', recordId: key, ...details },
			{ fingerprint: ['crm-signup', 'verify', 'error'], level: 'error' }
		)
	)
