// Statement signatures in CiviCRM: PauseaiStatement.sign, verify and publicList, called with
// the intake API account's key (crmIntake.ts). The contract is pauseai-civicrm's
// docs/intake-endpoint-plan.md, "Statement signatures".
//
// Emails and other submitted values must never reach a log or a report.
import { env } from '$env/dynamic/private'
import type { Signatory } from '$lib/types'
import {
	TIMEOUT_MS,
	callCrm,
	failureDetails,
	reportCrmProblem,
	type CrmFailure
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

const isTransient = (failure: CrmFailure) =>
	failure.cause === 'network' ||
	failure.cause === 'timeout' ||
	(failure.cause === 'http' && (failure.httpStatus ?? 0) >= 500)

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
		if (platform) platform.context.waitUntil(reporting)
		else await reporting
		return result
	}

	for (let attempt = 1; ; attempt++) {
		const budget = Math.min(TIMEOUT_MS, deadline - Date.now())
		const answer = await callCrm(
			'PauseaiStatement/sign',
			params,
			Math.max(budget, SIGN_MIN_ATTEMPT_MS)
		)
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
			isTransient(answer) &&
			deadline - Date.now() - SIGN_RETRY_DELAY_MS >= SIGN_MIN_ATTEMPT_MS
		if (!retry) {
			const details = { ...failureDetails(answer), attempt }
			return finish('failed', report('sign', 'error', details, 'error'))
		}
		console.warn('[crm-statement] sign failed, retrying', { ...failureDetails(answer), attempt })
		await wait(SIGN_RETRY_DELAY_MS)
	}
}

export type CrmVerifyResult = 'ok' | 'expired' | 'invalid' | 'failed'

/** Checks a statement link's key and token, which CiviCRM judges alone. Never rejects. */
export async function verifyStatementInCrm(key: string, token: string): Promise<CrmVerifyResult> {
	const answer = await callCrm('PauseaiStatement/verify', { key, token })
	if (!answer.ok) {
		await report('verify', 'error', failureDetails(answer), 'error')
		return 'failed'
	}
	const { status } = answer.row
	if (status === 'ok' || status === 'expired' || status === 'invalid') return status
	await report('verify', 'error', { cause: 'http', httpStatus: 200 }, 'error')
	return 'failed'
}

export type PublicList = { totalCount: number; signatories: Signatory[] }

/** The public list as CiviCRM builds it, or undefined when it can't be read. */
export async function publicListFromCrm(): Promise<PublicList | undefined> {
	const answer = await callCrm('PauseaiStatement/publicList', {})
	if (!answer.ok) {
		await report('publicList', 'error', failureDetails(answer), 'error')
		return undefined
	}
	const { totalCount, signatories } = answer.row
	if (typeof totalCount !== 'number' || !Array.isArray(signatories)) {
		await report('publicList', 'error', { cause: 'http', httpStatus: 200 }, 'error')
		return undefined
	}
	return {
		totalCount,
		signatories: (signatories as Signatory[]).map(
			({ private: isPrivate, name, country, bio, date }) => ({
				private: isPrivate,
				name,
				country,
				bio,
				date
			})
		)
	}
}
