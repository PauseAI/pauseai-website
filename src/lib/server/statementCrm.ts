// Statement signatures in CiviCRM: PauseaiStatement.sign, verify and publicList, called with
// the intake API account's key (crmIntake.ts). The contract is pauseai-civicrm's
// docs/intake-endpoint-plan.md, "Statement signatures".
//
// Emails and other submitted values must never reach a log or a report.
import { env } from '$env/dynamic/private'
import type { Signatory } from '$lib/types'
import {
	TIMEOUT_MS,
	afterResponse,
	callCrm,
	failureDetails,
	isPlainServerError,
	isTransient,
	reportCrmProblem,
	verifyLinkInCrm,
	wait,
	type CrmVerifyResult
} from '$lib/server/crmIntake'
import { COUNTRY_BY_ISO_CODE } from '$lib/server/countryCodes'

export type StatementBackend = 'airtable' | 'civicrm'

/**
 * Where signatures are written and listed from, and where /verify sends statement links
 * other than CiviCRM's own (verifyStatementInCrm). Anything but "civicrm" is Airtable.
 */
export const statementBackend = (): StatementBackend =>
	env.STATEMENT_BACKEND === 'civicrm' ? 'civicrm' : 'airtable'

/** The wording people sign, stored with each signature as its consent record. */
export const STATEMENT_VERSION = '2023-statement-v1'

// Only a failure that may be transient is retried, once, and the retry carries the same
// submission_id, so CiviCRM keeps one signature even when an attempt that timed out had
// written it. The retry runs only if the signing deadline leaves it SIGN_MIN_ATTEMPT_MS,
// about the slowest the CRM normally answers (crmIntake.ts).
export const SIGN_RETRY_DELAY_MS = 1000
export const SIGN_MIN_ATTEMPT_MS = 6000

const ISO_CODE_BY_COUNTRY = new Map(
	Object.entries(COUNTRY_BY_ISO_CODE).map(([code, country]) => [country, code])
)

/**
 * The email languages a signer can ask for. CiviCRM sends the email in it; Airtable picks the
 * language from the country instead, so with that backend it is only validated.
 */
export const SIGNATURE_LANGUAGES = ['en', 'es'] as const

/** A validated signature (statement.ts), whichever backend stores it. */
export type Signature = {
	name: string
	email: string
	/** As the form spells it, one of COUNTRIES. */
	country: string
	bio: string
	private: boolean
	language: (typeof SIGNATURE_LANGUAGES)[number]
}

export type CrmSignResult = 'ok' | 'refused' | 'failed'

const report = (
	action: string,
	outcome: string,
	details: Record<string, unknown>,
	level: 'error' | 'warning'
) =>
	reportCrmProblem(
		`CRM statement ${action} ${outcome}`,
		{ check: 'crm-statement', action, outcome, ...details },
		{ fingerprint: ['crm-statement', action, outcome], level }
	)

/**
 * Writes one signature, retrying a transient failure once if `deadline` (a Date.now() time)
 * allows, and never running an attempt past it. With a platform, failures are reported after
 * the response. `refused` means CiviCRM's validation disagreed with the website's, which is
 * checked first. Never rejects.
 */
export async function signInCrm(
	signature: Signature,
	{ deadline, platform }: { deadline: number; platform?: App.Platform }
): Promise<CrmSignResult> {
	const params = {
		name: signature.name,
		email: signature.email,
		country: ISO_CODE_BY_COUNTRY.get(signature.country) ?? signature.country,
		bio: signature.bio,
		private: signature.private,
		email_language: signature.language,
		statement_version: STATEMENT_VERSION,
		submission_id: crypto.randomUUID()
	}
	const finish = async (result: CrmSignResult, reporting: Promise<void>) => {
		await afterResponse(platform, reporting)
		return result
	}

	for (let attempt = 1; ; attempt++) {
		const remaining = deadline - Date.now()
		// A retry needs a useful slice of the request's time; past the deadline nothing is sent.
		if (remaining <= 0 || (attempt > 1 && remaining < SIGN_MIN_ATTEMPT_MS)) {
			return finish('failed', report('sign', 'error', { cause: 'deadline', attempt }, 'error'))
		}
		const answer = await callCrm('PauseaiStatement/sign', params, Math.min(TIMEOUT_MS, remaining))
		if (answer.ok) {
			if (answer.row.status === 'ok') return 'ok'
			if (answer.row.status === 'refused') {
				const outcome = `refused:${String(answer.row.reason)}`
				return finish('refused', report('sign', outcome, {}, 'warning'))
			}
			const details = { cause: 'http', httpStatus: 200, attempt }
			return finish('failed', report('sign', 'error', details, 'error'))
		}
		const retry =
			attempt === 1 &&
			(isTransient(answer) || isPlainServerError(answer)) &&
			deadline - Date.now() - SIGN_RETRY_DELAY_MS >= SIGN_MIN_ATTEMPT_MS
		if (!retry) {
			const details = { ...failureDetails(answer), attempt }
			return finish('failed', report('sign', 'error', details, 'error'))
		}
		console.warn('[crm-statement] sign failed, retrying', { ...failureDetails(answer), attempt })
		await wait(SIGN_RETRY_DELAY_MS)
	}
}

/** Checks a statement link's key and token, which CiviCRM judges alone. Never rejects. */
export const verifyStatementInCrm = (key: string, token: string): Promise<CrmVerifyResult> =>
	verifyLinkInCrm('PauseaiStatement/verify', key, token, (details) =>
		report('verify', 'error', details, 'error')
	)

export type PublicList = { totalCount: number; signatories: Signatory[] }

/** The public list as CiviCRM builds it, or undefined when it can't be read. */
export async function publicListFromCrm(): Promise<PublicList | undefined> {
	const answer = await callCrm('PauseaiStatement/publicList', {})
	if (!answer.ok) {
		await report('publicList', 'error', failureDetails(answer), 'error')
		return undefined
	}
	const list = asPublicList(answer.row)
	if (!list) await report('publicList', 'error', { cause: 'shape' }, 'error')
	return list
}

const publicFields = ({ private: isPrivate, name, country, bio, date }: Signatory): Signatory => ({
	private: isPrivate,
	name,
	country,
	bio,
	date
})

/** The list pauseai.info serves now, which /api/signatories republishes when CiviCRM fails. */
export const LIVE_LIST_URL = 'https://pauseai.info/api/signatories'
const LIVE_LIST_TIMEOUT_MS = 10_000

// Airtable's rows leave out an empty bio.
const isSignatory = (row: unknown): row is Signatory => {
	if (typeof row !== 'object' || row === null) return false
	const { private: isPrivate, name, country, bio, date } = row as Record<string, unknown>
	return (
		typeof isPrivate === 'boolean' &&
		typeof name === 'string' &&
		typeof country === 'string' &&
		typeof date === 'string' &&
		(bio === undefined || typeof bio === 'string')
	)
}

/**
 * A list fit to publish, keeping only the public fields: a non-empty list whose count matches
 * its rows, as both backends answer it. Anything else is undefined, so the caller falls back
 * to the next source instead of publishing an empty or truncated list.
 */
function asPublicList(body: unknown): PublicList | undefined {
	if (typeof body !== 'object' || body === null) return undefined
	const { totalCount, signatories } = body as Record<string, unknown>
	if (
		!Array.isArray(signatories) ||
		signatories.length === 0 ||
		totalCount !== signatories.length ||
		!signatories.every(isSignatory)
	) {
		return undefined
	}
	return { totalCount, signatories: signatories.map(publicFields) }
}

/**
 * The live list, reported as republished, or undefined (reported) when it can't be read or
 * isn't a non-empty list. Never rejects.
 */
export async function liveSignatoryList(): Promise<PublicList | undefined> {
	let details: Record<string, unknown>
	try {
		const response = await fetch(LIVE_LIST_URL, {
			signal: AbortSignal.timeout(LIVE_LIST_TIMEOUT_MS)
		})
		if (response.ok) {
			const list = asPublicList(await response.json().catch(() => undefined))
			if (list) {
				await report('publicList', 'republished-live', { totalCount: list.totalCount }, 'warning')
				return list
			}
			details = { cause: 'shape' }
		} else {
			details = { cause: 'http', httpStatus: response.status }
		}
	} catch (e) {
		details = { cause: 'network', errorName: e instanceof Error ? e.name : typeof e }
	}
	await report('publicList', 'live-error', details, 'error')
	return undefined
}
