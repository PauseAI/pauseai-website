// The Contact Us form's notification to the team: PauseaiContactUs.send, called with the website
// API account's key (crmIntake.ts). CiviCRM builds and sends the email and stores nothing. The
// contract is pauseai-civicrm's docs/intake-endpoint-plan.md, "Contact Us".
//
// Submitted values must never reach a log or a report.
import { dev } from '$app/environment'
import {
	afterResponse,
	callCrmUntil,
	failureDetails,
	reportCrmProblem
} from '$lib/server/crmIntake'
import { isNonProductionDeploy } from '$lib/server/testHost'

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

export type ContactSendResult = 'ok' | 'refused' | 'failed'

// The CRM's reasons are codes; anything else is reported as unknown, so a report can never
// carry free text.
const asReasonCode = (reason: unknown) =>
	typeof reason === 'string' && /^[a-z_]{1,64}$/.test(reason) ? reason : 'unknown'

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
 * them) once if `deadline` (a Date.now() time) allows. There is no idempotency key, so a retry
 * after a timed-out attempt that did send delivers a second notification. With a platform,
 * failures are reported after the response. Without the CRM's settings, a dev server, deploy
 * preview or branch deploy sends nothing and answers `ok`. Never rejects.
 */
export async function sendContactToCrm(
	request: ContactRequest,
	{ deadline, hostname, platform }: { deadline: number; hostname: string; platform?: App.Platform }
): Promise<ContactSendResult> {
	const finish = async (result: ContactSendResult, reporting: Promise<void>) => {
		await afterResponse(platform, reporting)
		return result
	}

	const { answer, attempt } = await callCrmUntil('PauseaiContactUs/send', request, {
		deadline,
		check: 'contact-us',
		retryRow: (row) =>
			row.status === 'error' && row.reason === 'send_failed' ? 'send_failed' : undefined
	})
	if (!answer.ok) {
		if (answer.cause === 'not_configured' && (dev || isNonProductionDeploy(hostname, platform))) {
			console.warn('[contact-us] CRM_URL or CRM_KEY is not set: nothing sent')
			return 'ok'
		}
		const details = { ...failureDetails(answer), attempt }
		return finish('failed', report(request.type, 'error', details, 'error'))
	}
	const { status, reason } = answer.row
	if (status === 'ok') return 'ok'
	if (status === 'refused') {
		const outcome = `refused:${asReasonCode(reason)}`
		return finish('refused', report(request.type, outcome, {}, 'warning'))
	}
	const details =
		status === 'error'
			? { cause: 'crm_error', reason: asReasonCode(reason), attempt }
			: { cause: 'http', httpStatus: 200, attempt }
	return finish('failed', report(request.type, 'error', details, 'error'))
}
