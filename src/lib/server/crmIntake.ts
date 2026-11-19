// callCrm and callCrmRows call CiviCRM's API4 as the website API account (CRM_URL,
// CRM_KEY). The rest of this file reports each Members row the onboarding
// form writes to CiviCRM's member intake (PauseaiMemberIntake.submit). The
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
type Cause = 'not_configured' | 'http' | 'timeout' | 'network' | 'deadline'

// The form routes run as Netlify Edge Functions, which must answer within 40 s, and CiviCRM
// may already hold a write whose request then got no answer. Turnstile's check
// (TURNSTILE_TIMEOUT_MS) and the CRM's attempts (callCrmUntil) fit inside this, measured from
// the request's start.
export const CRM_REQUEST_DEADLINE_MS = 20_000

// callCrmUntil retries once, and only if the deadline leaves the retry CRM_MIN_ATTEMPT_MS,
// about the slowest the CRM normally answers.
export const CRM_RETRY_DELAY_MS = 1000
export const CRM_MIN_ATTEMPT_MS = 6000

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

/** Every row an action answers in `values`, or why there are none. */
export type CrmRows = { ok: true; rows: Record<string, unknown>[] } | CrmFailure

export const isRow = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

/** CRM_URL without its trailing slashes, or undefined when unset. */
export const crmBaseUrl = (): string | undefined => env.CRM_URL?.replace(/\/+$/, '') || undefined

/**
 * Calls one API4 action (`Entity/action`) as the website API account, giving up
 * after `timeoutMs`, and answers the first row of `values`. Never rejects: a failure
 * is an answer with what caused it.
 */
export async function callCrm(
	action: string,
	params: unknown,
	timeoutMs = TIMEOUT_MS
): Promise<CrmAnswer> {
	const answer = await callCrmValues(action, params, timeoutMs, (values) =>
		isRow(values[0]) ? values[0] : undefined
	)
	return answer.ok ? { ok: true, row: answer.value } : answer
}

/** As callCrm, for an action that answers a list of rows. */
export async function callCrmRows(
	action: string,
	params: unknown,
	timeoutMs = TIMEOUT_MS
): Promise<CrmRows> {
	const answer = await callCrmValues(action, params, timeoutMs, (values) =>
		values.every(isRow) ? values : undefined
	)
	return answer.ok ? { ok: true, rows: answer.value } : answer
}

/** `read` takes what the answer's `values` must hold; undefined makes it a failure. */
async function callCrmValues<T>(
	action: string,
	params: unknown,
	timeoutMs: number,
	read: (values: unknown[]) => T | undefined
): Promise<{ ok: true; value: T } | CrmFailure> {
	const base = crmBaseUrl()
	const key = env.CRM_KEY
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
		const body = (await response.json().catch(() => null)) as { values?: unknown } | null
		if (signal.aborted) return { ok: false, cause: 'timeout' }
		const value = Array.isArray(body?.values) ? read(body.values) : undefined
		if (value === undefined) return httpError
		return { ok: true, value }
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

const isTransientFailure = (failure: CrmFailure) =>
	failure.cause === 'network' ||
	failure.cause === 'timeout' ||
	(failure.cause === 'http' && (failure.httpStatus ?? 0) >= 500)

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Calls an action as callCrm does, retrying once after CRM_RETRY_DELAY_MS when the failure may
 * be transient or `retryRow` names a cause for the row answered, if `deadline` (a Date.now()
 * time) allows. No attempt runs past the deadline; once it has passed, the answer is a
 * `deadline` failure. Answers the last attempt's answer and number. Never rejects.
 */
export async function callCrmUntil(
	action: string,
	params: unknown,
	{
		deadline,
		check,
		retryRow
	}: {
		deadline: number
		/** Names the call in the retry's log line. */
		check: string
		retryRow?: (row: Record<string, unknown>) => string | undefined
	}
): Promise<{ answer: CrmAnswer; attempt: number }> {
	for (let attempt = 1; ; attempt++) {
		const remaining = deadline - Date.now()
		if (remaining <= 0 || (attempt > 1 && remaining < CRM_MIN_ATTEMPT_MS)) {
			return { answer: { ok: false, cause: 'deadline' }, attempt }
		}
		const answer = await callCrm(action, params, Math.min(TIMEOUT_MS, remaining))
		const retryCause = answer.ok
			? retryRow?.(answer.row)
			: isTransientFailure(answer)
				? answer.cause
				: undefined
		const retry =
			attempt === 1 &&
			retryCause !== undefined &&
			deadline - Date.now() - CRM_RETRY_DELAY_MS >= CRM_MIN_ATTEMPT_MS
		if (!retry) return { answer, attempt }
		const details = answer.ok ? { cause: retryCause } : failureDetails(answer)
		console.warn(`[${check}] ${action} failed, retrying`, { ...details, attempt })
		await wait(CRM_RETRY_DELAY_MS)
	}
}

/**
 * Hands `work` to the platform to finish after the response, or awaits it where there is no
 * platform (the Node dev server, tests).
 */
export async function afterResponse(
	platform: App.Platform | undefined,
	work: Promise<unknown>
): Promise<void> {
	if (platform) platform.context.waitUntil(work)
	else await work
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
