// Statement signatures in CiviCRM: PauseaiStatement.sign, verify and publicList, called with
// the intake API account's key (crmIntake.ts). The contract is pauseai-civicrm's
// docs/intake-endpoint-plan.md, "Statement signatures".
//
// Emails and other submitted values must never reach a log or a report.
import { env } from '$env/dynamic/private'
import type { Signatory } from '$lib/types'
import { callCrm, type CrmFailure } from '$lib/server/crmIntake'
import { COUNTRY_BY_ISO_CODE } from '$lib/server/countryCodes'
import { flushReports, reportError } from '$lib/server/sentry'

export type StatementBackend = 'airtable' | 'civicrm'

/**
 * Where signatures are written and listed from, and where /verify sends statement links
 * other than CiviCRM's own (verifyStatementInCrm). Anything but "civicrm" is Airtable.
 */
export const statementBackend = (): StatementBackend =>
	env.STATEMENT_BACKEND === 'civicrm' ? 'civicrm' : 'airtable'

/** The wording people sign, stored with each signature as its consent record. */
export const STATEMENT_VERSION = '2023-statement-v1'

// Waits before the second and third attempt. Only failures that may be transient are
// retried, and a retry carries the same submission_id, so CiviCRM keeps one signature even
// when an attempt that timed out had written it.
export const SIGN_RETRY_DELAYS_MS = [1000, 3000] as const

const ISO_CODE_BY_COUNTRY = new Map(
	Object.entries(COUNTRY_BY_ISO_CODE).map(([code, country]) => [country, code])
)

export type CrmSignature = {
	name: string
	email: string
	/** As the form spells it, one of COUNTRIES. */
	country: string
	bio: string
	private: boolean
	language: 'en' | 'es'
}

export type CrmSignResult = 'ok' | 'refused' | 'failed'

const isTransient = (failure: CrmFailure) =>
	failure.cause === 'network' ||
	failure.cause === 'timeout' ||
	(failure.cause === 'http' && (failure.httpStatus ?? 0) >= 500)

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function report(
	action: string,
	outcome: string,
	details: Record<string, unknown>,
	level: 'error' | 'warning'
) {
	const context = { check: 'crm-statement', action, outcome, ...details }
	console.warn('[crm-statement] not accepted', context)
	await reportError(new Error(`CRM statement ${action} ${outcome}`), context, {
		fingerprint: ['crm-statement', action, outcome],
		level
	})
	await flushReports()
}

const failureDetails = ({ cause, httpStatus, errorName }: CrmFailure) => ({
	cause,
	...(httpStatus === undefined ? {} : { httpStatus }),
	...(errorName === undefined ? {} : { errorName })
})

/**
 * Writes one signature, retrying transient failures. `refused` means CiviCRM's validation
 * disagreed with the website's, which is checked first. Never rejects.
 */
export async function signInCrm(signature: CrmSignature): Promise<CrmSignResult> {
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

	for (let attempt = 1; ; attempt++) {
		const answer = await callCrm('PauseaiStatement/sign', params)
		if (answer.ok) {
			if (answer.row.status === 'ok') return 'ok'
			if (answer.row.status === 'refused') {
				await report('sign', `refused:${String(answer.row.reason)}`, {}, 'warning')
				return 'refused'
			}
			await report('sign', 'error', { cause: 'http', httpStatus: 200, attempt }, 'error')
			return 'failed'
		}
		const delay = SIGN_RETRY_DELAYS_MS[attempt - 1]
		if (delay === undefined || !isTransient(answer)) {
			await report('sign', 'error', { ...failureDetails(answer), attempt }, 'error')
			return 'failed'
		}
		console.warn('[crm-statement] sign failed, retrying', { ...failureDetails(answer), attempt })
		await wait(delay)
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
