// The website's client for CiviCRM's API as the intake API account (callCrm),
// used here to report each Members row the onboarding form writes to CiviCRM's
// member intake (PauseaiMemberIntake.submit), and by statementCrm.ts. The
// contract, outcome codes included, is pauseai-civicrm's
// docs/intake-endpoint-plan.md; docs/join-form-flow.md, "CRM intake", has where
// it runs and how to switch it on.
//
// For signups, Airtable stays the system of record and the CRM's nightly import
// repairs whatever this misses, so nothing here may fail or slow the signup:
// the call runs after the response, every failure becomes an outcome, and an
// outcome is only reported.

import { env } from '$env/dynamic/private'
import type { WrittenRecord } from '$lib/airtable'
import { flushReports, reportError } from '$lib/server/sentry'

const API_PATH = '/civicrm/ajax/api4/'
// The CRM can take about 6 seconds to answer and completes the write even after
// the caller aborts, so a shorter wait reports timeouts for writes that succeeded.
export const TIMEOUT_MS = 10_000
type Cause = 'not_configured' | 'http' | 'timeout' | 'network'

export type CrmFailure = {
	ok: false
	cause: Cause
	httpStatus?: number
	errorName?: string
}

/** The one row an action answers in `values`, or why there is none. */
export type CrmAnswer = { ok: true; row: Record<string, unknown> } | CrmFailure

type Result =
	| { outcome: 'ok' }
	| { outcome: `refused:${string}` }
	| ({ outcome: 'error' } & Omit<CrmFailure, 'ok'>)

export type Outcome = Result['outcome']

const isCrmIntakeEnabled = () => env.CRM_INTAKE_ENABLED === 'true'

/**
 * Calls one API4 action (`Entity/action`) as the intake API account, giving up
 * after `timeoutMs`. Never rejects: a failure is an answer with what caused it.
 */
export async function callCrm(
	action: string,
	params: unknown,
	timeoutMs = TIMEOUT_MS
): Promise<CrmAnswer> {
	const base = env.CRM_INTAKE_URL?.replace(/\/+$/, '')
	const key = env.CRM_INTAKE_KEY
	if (!base || !key) return { ok: false, cause: 'not_configured' }

	const signal = AbortSignal.timeout(timeoutMs)
	try {
		const response = await fetch(base + API_PATH + action, {
			method: 'POST',
			headers: {
				// The CRM accepts an API key only in X-Civi-Auth; its Authorization
				// header takes JWTs only (authx settings).
				'X-Civi-Auth': `Bearer ${key}`,
				'X-Requested-With': 'XMLHttpRequest',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({ params: JSON.stringify(params) }),
			signal
		})
		// Only the status: an error body's text could echo what the request carried.
		const httpError = { ok: false, cause: 'http', httpStatus: response.status } as const
		if (!response.ok) return httpError
		const body = (await response.json().catch(() => null)) as { values?: unknown[] } | null
		if (signal.aborted) return { ok: false, cause: 'timeout' }
		const row = body?.values?.[0]
		if (typeof row !== 'object' || row === null || Array.isArray(row)) return httpError
		return { ok: true, row: row as Record<string, unknown> }
	} catch (error) {
		return {
			ok: false,
			cause: signal.aborted ? 'timeout' : 'network',
			errorName: (error as Error)?.name
		}
	}
}

/** What a failure may report: its cause, never a value the request carried. */
export const failureDetails = ({ cause, httpStatus, errorName }: CrmFailure) => ({
	cause,
	...(httpStatus === undefined ? {} : { httpStatus }),
	...(errorName === undefined ? {} : { errorName })
})

/**
 * Logs and reports an answer that was not `ok`, then sends the report. `details` must never
 * hold a submitted value (personal data) or the key. Never rejects.
 */
export async function reportCrmProblem(
	message: string,
	details: { check: string } & Record<string, unknown>,
	options: { fingerprint: string[]; level: 'error' | 'warning' }
): Promise<void> {
	console.warn(`[${details.check}] not accepted`, details)
	await reportError(new Error(message), details, options)
	await flushReports()
}

/** Never rejects: a failure is the `error` outcome, with what caused it. */
export async function submitToCrm(record: WrittenRecord, token: string): Promise<Result> {
	const answer = await callCrm('PauseaiMemberIntake/submit', { record, token })
	if (!answer.ok) return { outcome: 'error', ...failureDetails(answer) }
	if (answer.row.status === 'ok') return { outcome: 'ok' }
	if (answer.row.status === 'refused') return { outcome: `refused:${String(answer.row.reason)}` }
	return { outcome: 'error', cause: 'http', httpStatus: 200 }
}

/**
 * Submits the record and reports anything but `ok`. Refusals and errors go to
 * Sentry as separate issues, one per outcome code, carrying the record id and
 * the outcome: never a field value (personal data) or the key. Never rejects.
 */
export async function reportToCrm(record: WrittenRecord, token: string): Promise<Outcome> {
	const result = await submitToCrm(record, token)
	if (result.outcome === 'ok') return result.outcome
	await reportCrmProblem(
		`CRM intake ${result.outcome}`,
		{ check: 'crm-intake', recordId: record.id, ...result },
		{
			fingerprint: ['crm-intake', result.outcome],
			level: result.outcome === 'error' ? 'error' : 'warning'
		}
	)
	return result.outcome
}

/**
 * Sends the record to the CRM after the response, when the flag is on. On
 * Netlify Edge `context.waitUntil` keeps the function alive until the call
 * settles; without a platform (the Node dev server) the call simply runs on.
 * `token` is the continuation token the post carried: empty on a create.
 */
export function queueCrmIntake(
	platform: App.Platform | undefined,
	record: WrittenRecord,
	token: string
): void {
	if (!isCrmIntakeEnabled()) return
	// Started before the optional chain, which would skip it without a platform.
	const pending = reportToCrm(record, token)
	platform?.context.waitUntil(pending)
}
