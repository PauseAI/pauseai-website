// The Contact Us form's notification to the team: PauseaiContactUs.send, called with the website
// API account's key (crmIntake.ts). CiviCRM builds and sends the email and stores nothing. The
// contract is pauseai-civicrm's docs/intake-endpoint-plan.md, "Contact Us".
//
// Submitted values must never reach a log or a report.
import { dev } from '$app/environment'
import {
	TIMEOUT_MS,
	callCrm,
	failureDetails,
	reportCrmProblem,
	type CrmFailure
} from '$lib/server/crmIntake'
import { isTestHostname } from '$lib/server/testHost'

/** Each enquiry type, spelled as the CRM takes it, and the inbox it reaches. */
export const CONTACT_INBOXES = {
	Media: 'press@pauseai.info',
	Partnerships: 'partnerships@pauseai.info',
	Feedback: 'feedback@pauseai.info'
} as const

export type ContactType = keyof typeof CONTACT_INBOXES

export type ContactRequest = {
	type: ContactType
	name: string
	email: string
	subject: string
	message: string
	organization?: string
	city_country?: string
}

// The actions run as Netlify Edge Functions, which must answer within 40 s, and Turnstile's
// check (TURNSTILE_TIMEOUT_MS) comes first, so the deadline is measured from the request's start.
export const CONTACT_DEADLINE_MS = 20_000

// Only a failure that may be transient is retried, once. There is no idempotency key, so a
// retry after a timed-out attempt that did send delivers a second notification. The retry runs
// only if the deadline leaves it CONTACT_MIN_ATTEMPT_MS, about the slowest the CRM normally answers.
export const CONTACT_RETRY_DELAY_MS = 1000
export const CONTACT_MIN_ATTEMPT_MS = 6000

export type ContactSendResult = 'ok' | 'refused' | 'failed'

const isTransient = (failure: CrmFailure) =>
	failure.cause === 'network' ||
	failure.cause === 'timeout' ||
	(failure.cause === 'http' && (failure.httpStatus ?? 0) >= 500)

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const report = (
	type: ContactType,
	outcome: string,
	details: Record<string, unknown>,
	level: 'error' | 'warning'
) =>
	reportCrmProblem(
		`Contact Us ${outcome}`,
		{ check: 'contact-us', type, outcome, ...details },
		{ fingerprint: ['contact-us', outcome], level }
	)

/**
 * Sends one enquiry to the team, retrying a transient failure (the CRM's `send_failed` among
 * them) once if `deadline` (a Date.now() time) allows, and never running an attempt past it.
 * With a platform, failures are reported after the response. Without the CRM's settings, a dev
 * server or deploy preview sends nothing and answers `ok`. Never rejects.
 */
export async function sendContactToCrm(
	request: ContactRequest,
	{ deadline, hostname, platform }: { deadline: number; hostname: string; platform?: App.Platform }
): Promise<ContactSendResult> {
	const finish = async (result: ContactSendResult, reporting: Promise<void>) => {
		if (platform) platform.context.waitUntil(reporting)
		else await reporting
		return result
	}

	for (let attempt = 1; ; attempt++) {
		const remaining = deadline - Date.now()
		if (remaining <= 0 || (attempt > 1 && remaining < CONTACT_MIN_ATTEMPT_MS)) {
			return finish(
				'failed',
				report(request.type, 'error', { cause: 'deadline', attempt }, 'error')
			)
		}
		const answer = await callCrm('PauseaiContactUs/send', request, Math.min(TIMEOUT_MS, remaining))
		let failure: Record<string, unknown>
		let transient: boolean
		if (answer.ok) {
			const { status, reason } = answer.row
			if (status === 'ok') return 'ok'
			if (status === 'refused') {
				return finish('refused', report(request.type, `refused:${String(reason)}`, {}, 'warning'))
			}
			transient = status === 'error' && reason === 'send_failed'
			failure = transient
				? { cause: 'send_failed', attempt }
				: { cause: 'http', httpStatus: 200, attempt }
		} else {
			if (answer.cause === 'not_configured' && (dev || isTestHostname(hostname))) {
				console.warn('[contact-us] CRM_URL or CRM_KEY is not set: nothing sent')
				return 'ok'
			}
			transient = isTransient(answer)
			failure = { ...failureDetails(answer), attempt }
		}
		const retry =
			attempt === 1 &&
			transient &&
			deadline - Date.now() - CONTACT_RETRY_DELAY_MS >= CONTACT_MIN_ATTEMPT_MS
		if (!retry) return finish('failed', report(request.type, 'error', failure, 'error'))
		console.warn('[contact-us] send failed, retrying', failure)
		await wait(CONTACT_RETRY_DELAY_MS)
	}
}
