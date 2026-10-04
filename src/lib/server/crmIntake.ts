// Reports each Members row the onboarding form writes to CiviCRM's member
// intake (PauseaiMemberIntake.submit). The contract, outcome codes included, is
// pauseai-civicrm's docs/intake-endpoint-plan.md; docs/join-form-flow.md, "CRM
// intake", has where it runs and how to switch it on.
//
// Airtable stays the system of record and the CRM's nightly import repairs
// whatever this misses, so nothing here may fail or slow the signup: the call
// runs after the response, every failure becomes an outcome, and an outcome is
// only reported.

import { env } from '$env/dynamic/private'
import type { WrittenRecord } from '$lib/airtable'
import { flushReports, reportError } from '$lib/server/sentry'

const PATH = '/civicrm/ajax/api4/PauseaiMemberIntake/submit'
export const TIMEOUT_MS = 3000
// The CRM's refusal codes are lowercase words; anything else is not a refusal
// this side can name, so it is an error.
const REASON = /^[a-z_]{1,40}$/
// CRM_Core_Error::createErrorId: 12 letters or digits in dashed groups of four.
// API4 puts it in `error_id` when it shows the real message, and otherwise only
// inside its masked message, "... (Error ID: <id>)".
const ERROR_ID = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/
const MASKED_ERROR_ID = /\(Error ID: ([^)]*)\)/

// Only the id the CRM log holds, never the message text, which a CRM error could
// fill with whatever the request carried.
function errorIdOf(body: { error_id?: unknown; error_message?: unknown } | null) {
	const candidate =
		typeof body?.error_id === 'string'
			? body.error_id
			: typeof body?.error_message === 'string'
				? MASKED_ERROR_ID.exec(body.error_message)?.[1]
				: undefined
	return candidate && ERROR_ID.test(candidate) ? candidate : undefined
}

type Cause = 'not_configured' | 'http' | 'timeout' | 'network' | 'unexpected_response'

type Result =
	| { outcome: 'ok' }
	| { outcome: `refused:${string}` }
	| {
			outcome: 'error'
			cause: Cause
			httpStatus?: number
			errorId?: string
			errorName?: string
	  }

export type Outcome = Result['outcome']

const isCrmIntakeEnabled = () => env.CRM_INTAKE_ENABLED === 'true'

/** Never rejects: a failure is the `error` outcome, with what caused it. */
export async function submitToCrm(record: WrittenRecord, token: string): Promise<Result> {
	const base = env.CRM_INTAKE_URL?.replace(/\/+$/, '')
	const key = env.CRM_INTAKE_KEY
	if (!base || !key) return { outcome: 'error', cause: 'not_configured' }

	const signal = AbortSignal.timeout(TIMEOUT_MS)
	try {
		const response = await fetch(base + PATH, {
			method: 'POST',
			headers: {
				// The CRM accepts an API key only in X-Civi-Auth; its Authorization
				// header takes JWTs only (authx settings).
				'X-Civi-Auth': `Bearer ${key}`,
				'X-Requested-With': 'XMLHttpRequest',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({ params: JSON.stringify({ record, token }) }),
			signal
		})
		const body = (await response.json().catch(() => null)) as {
			values?: { status?: unknown; reason?: unknown }[]
			error_id?: unknown
			error_message?: unknown
		} | null
		if (signal.aborted) return { outcome: 'error', cause: 'timeout' }
		if (!response.ok) {
			return {
				outcome: 'error',
				cause: 'http',
				httpStatus: response.status,
				errorId: errorIdOf(body)
			}
		}
		const row = body?.values?.[0]
		if (row?.status === 'ok') return { outcome: 'ok' }
		if (row?.status === 'refused' && typeof row.reason === 'string' && REASON.test(row.reason)) {
			return { outcome: `refused:${row.reason}` }
		}
		return { outcome: 'error', cause: 'unexpected_response' }
	} catch (error) {
		return {
			outcome: 'error',
			cause: signal.aborted ? 'timeout' : 'network',
			errorName: (error as Error)?.name
		}
	}
}

/**
 * Submits the record and reports anything but `ok`. Refusals and errors go to
 * Sentry as separate issues, one per outcome code, carrying the record id and
 * the outcome: never a field value (personal data) or the key. Never rejects.
 */
export async function reportToCrm(record: WrittenRecord, token: string): Promise<Outcome> {
	const result = await submitToCrm(record, token)
	const details = { check: 'crm-intake', recordId: record.id, ...result }
	if (result.outcome === 'ok') {
		console.log('[crm-intake] ok', details)
		return result.outcome
	}
	console.warn('[crm-intake] not accepted', details)
	await reportError(new Error(`CRM intake ${result.outcome}`), details, {
		fingerprint: ['crm-intake', result.outcome],
		level: result.outcome === 'error' ? 'error' : 'warning'
	})
	await flushReports()
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
