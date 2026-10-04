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

export type Outcome = 'ok' | `refused:${string}` | 'error'

type Result = { outcome: Outcome; context: Record<string, unknown> }

const isCrmIntakeEnabled = () => env.CRM_INTAKE_ENABLED === 'true'

/** Never rejects: a failure is the `error` outcome, with what caused it. */
export async function submitToCrm(
	record: WrittenRecord,
	token: string,
	fetchImpl: typeof fetch = fetch
): Promise<Result> {
	const base = env.CRM_INTAKE_URL?.replace(/\/+$/, '')
	const key = env.CRM_INTAKE_KEY
	if (!base || !key) return { outcome: 'error', context: { cause: 'not_configured' } }

	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
	try {
		const response = await fetchImpl(base + PATH, {
			method: 'POST',
			headers: {
				// The only header CiviCRM accepts an API key in.
				'X-Civi-Auth': `Bearer ${key}`,
				'X-Requested-With': 'XMLHttpRequest',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({ params: JSON.stringify({ record, token }) }),
			signal: controller.signal
		})
		const body = (await response.json().catch(() => null)) as {
			values?: { status?: unknown; reason?: unknown }[]
			error_code?: unknown
			error_message?: unknown
		} | null
		if (controller.signal.aborted) return { outcome: 'error', context: { cause: 'timeout' } }
		if (!response.ok) {
			// API4 masks the message, but it carries the error id the CRM log holds.
			const message = body?.error_message
			return {
				outcome: 'error',
				context: {
					cause: 'http',
					httpStatus: response.status,
					errorMessage: typeof message === 'string' ? message.slice(0, 200) : undefined
				}
			}
		}
		const row = body?.values?.[0]
		if (row?.status === 'ok') return { outcome: 'ok', context: {} }
		if (row?.status === 'refused' && typeof row.reason === 'string' && REASON.test(row.reason)) {
			return { outcome: `refused:${row.reason}`, context: {} }
		}
		return { outcome: 'error', context: { cause: 'unexpected_response' } }
	} catch (error) {
		const cause = controller.signal.aborted ? 'timeout' : 'network'
		return { outcome: 'error', context: { cause, errorName: (error as Error)?.name } }
	} finally {
		clearTimeout(timer)
	}
}

/**
 * Submits the record and reports anything but `ok`. Refusals and errors go to
 * Sentry as separate issues, one per refusal code, carrying the record id and
 * the outcome: never a field value (personal data) or the key. Never rejects.
 */
export async function reportToCrm(
	record: WrittenRecord,
	token: string,
	fetchImpl: typeof fetch = fetch
): Promise<Outcome> {
	try {
		const { outcome, context } = await submitToCrm(record, token, fetchImpl)
		const details = { check: 'crm-intake', recordId: record.id, outcome, ...context }
		if (outcome === 'ok') {
			console.log('[crm-intake] ok', details)
			return outcome
		}
		const refused = outcome !== 'error'
		console.warn('[crm-intake] not accepted', details)
		await reportError(new Error(`CRM intake ${outcome}`), details, {
			fingerprint: ['crm-intake', outcome],
			level: refused ? 'warning' : 'error'
		})
		await flushReports()
		return outcome
	} catch (error) {
		console.error('[crm-intake] reporting failed', error)
		return 'error'
	}
}

type WaitUntil = { context?: { waitUntil?: (promise: Promise<unknown>) => void } }

/**
 * Sends the record to the CRM after the response, when the flag is on. On
 * Netlify Edge `context.waitUntil` keeps the function alive until the call
 * settles; without a platform (the Node dev server) the call simply runs on.
 * `token` is the continuation token the post carried: empty on a create.
 */
export function queueCrmIntake(
	platform: WaitUntil | undefined,
	record: WrittenRecord,
	token: string
): void {
	if (!isCrmIntakeEnabled()) return
	const pending = reportToCrm(record, token)
	platform?.context?.waitUntil?.(pending)
}
