// Signups that live in CiviCRM alone (pauseai-civicrm #1278): PauseaiMemberIntake.submit and
// verify for a signup key, called with the intake API account's key (crmIntake.ts). The
// contract is pauseai-civicrm's docs/intake-endpoint-plan.md, "Signup keys".
//
// Unlike a Members row's report (crmIntake.ts), nothing else keeps a copy of such a signup, so
// the form awaits the call, retries what may be transient, and tells the person when it could
// not confirm the signup was saved.
//
// Emails and other submitted values must never reach a log or a report: only the key does.
import { env } from '$env/dynamic/private'
import type { WrittenRecord } from '$lib/airtable'
import {
	TIMEOUT_MS,
	callCrm,
	failureDetails,
	isTransient,
	reportCrmProblem,
	verifyLinkInCrm,
	wait,
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

// A retry starts only if this much of the deadline is left: comfortably above how long CiviCRM
// takes to answer a signup at production latency (1.5 to 2 s), so the attempt can finish.
const MIN_ATTEMPT_MS = 4_000
// Growing, so an outage of immediate failures as long as a deploy's swap (about 14 s) is
// outlasted: attempts start near 0, 1, 3, 7 and 15 s.
const RETRY_DELAYS_MS = [1_000, 2_000, 4_000, 8_000]

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
	if (outcome.startsWith('refused:token_')) return 'session_expired'
	if (ROW_GONE.some((reason) => outcome === `refused:${reason}`)) return 'row_gone'
	return 'not_saved'
}

/** One attempt's outcome, with what caused it when another attempt may get past it. */
async function attempt(
	params: unknown,
	timeoutMs: number
): Promise<{ outcome: Outcome; retry?: Record<string, unknown> }> {
	const answer = await callCrm('PauseaiMemberIntake/submit', params, timeoutMs)
	if (!answer.ok) {
		return { outcome: 'error', retry: isTransient(answer) ? failureDetails(answer) : undefined }
	}
	const { status, reason } = answer.row
	if (status === 'ok') return { outcome: 'ok' }
	if (status === 'refused') {
		return { outcome: `refused:${REFUSALS.has(String(reason)) ? String(reason) : 'unknown'}` }
	}
	if (status === 'error' && reason === 'memberships') return { outcome: 'error:memberships' }
	// Another call for this key is still running; it wrote nothing.
	if (status === 'error' && reason === 'locked') {
		return { outcome: 'error', retry: { cause: 'locked' } }
	}
	return { outcome: 'error' }
}

/**
 * Submits a signup key's record, awaited, retrying with the same key, token and record while the
 * failure may be transient and `deadline` (a Date.now() time) leaves a retry time to finish.
 * Every outcome but `ok` is reported to Sentry with the key alone, refusals as warnings and the
 * rest as errors (the alert rule's), after the response when there is a platform. Never rejects.
 */
export async function submitSignup(
	record: WrittenRecord,
	token: string,
	deadline: number,
	platform?: App.Platform
): Promise<SignupResult> {
	const params = { record, token }
	let outcome: Outcome = 'error'
	let details: Record<string, unknown> = { cause: 'deadline' }
	for (const delay of [0, ...RETRY_DELAYS_MS]) {
		if (delay) {
			if (deadline - Date.now() - delay < MIN_ATTEMPT_MS) break
			console.warn('[crm-signup] submit failed, retrying', details)
			await wait(delay)
		}
		const remaining = deadline - Date.now()
		if (remaining <= 0) break
		const step = await attempt(params, Math.min(TIMEOUT_MS, remaining))
		outcome = step.outcome
		details = step.retry ?? {}
		if (!step.retry) break
	}
	if (outcome !== 'ok') {
		const reporting = reportCrmProblem(
			`CRM signup ${outcome}`,
			{ check: 'crm-signup', recordId: record.id, outcome, ...details },
			{
				fingerprint: ['crm-signup', outcome],
				level: outcome.startsWith('refused:') ? 'warning' : 'error'
			}
		)
		if (platform) platform.context.waitUntil(reporting)
		else await reporting
	}
	return resultOf(outcome)
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
