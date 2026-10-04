export const prerender = false

import { env } from '$env/dynamic/private'
import { renderOnboardingEmailV2 } from '$lib/server/onboardingEmail/index.js'
import { CONTRACT_VERSION, parseV2Request } from '$lib/server/onboardingEmail/v2Request.js'
import { reportError } from '$lib/server/sentry'
import { json } from '@sveltejs/kit'
import { StatusCodes } from 'http-status-codes'
import type { RequestHandler } from './$types'

// The v2 render for the CRM: docs/onboarding-email-v2-contract.md is the contract, including
// every error code below. Render-only: it sends nothing and chooses no recipient, sender or
// reply-to.

type ErrorCode =
	| 'unauthorized'
	| 'invalid_json'
	| 'unsupported_version'
	| 'invalid_request'
	| 'verification_unavailable'
	| 'render_failed'

function error(status: number, code: ErrorCode, message: string): Response {
	return json({ error: { code, message } }, { status })
}

async function sha256(value: string): Promise<Uint8Array> {
	return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))
}

/** Compares digests, so the time taken does not depend on how much of the header matched. */
async function authorized(header: string, secret: string): Promise<boolean> {
	const [given, expected] = await Promise.all([sha256(header), sha256(`Bearer ${secret}`)])
	let difference = 0
	for (let i = 0; i < expected.length; i++) difference |= given[i] ^ expected[i]
	return difference === 0
}

export const POST: RequestHandler = async ({ request }) => {
	// Separate from v1's ONBOARDING_EMAIL_RENDER_SECRET so each caller's secret rotates alone.
	const secret = env.ONBOARDING_RENDER_V2_SECRET
	if (!secret || !(await authorized(request.headers.get('authorization') ?? '', secret))) {
		return error(StatusCodes.UNAUTHORIZED, 'unauthorized', 'Missing or wrong bearer secret')
	}

	let body: unknown
	try {
		body = await request.json()
	} catch {
		return error(StatusCodes.BAD_REQUEST, 'invalid_json', 'Body is not valid JSON')
	}

	const parsed = parseV2Request(body)
	if (!parsed.ok) return error(StatusCodes.BAD_REQUEST, parsed.error.code, parsed.error.message)
	// Every v2 link is signed: without the secret there is no link to give.
	const verificationSecret = env.EMAIL_VERIFICATION_SECRET
	if (!verificationSecret) {
		console.error('[verification] EMAIL_VERIFICATION_SECRET is not set: refusing v2 renders')
		await reportError(new Error('EMAIL_VERIFICATION_SECRET is not set'), {
			route: 'onboarding-email/v2'
		})
		return error(
			StatusCodes.SERVICE_UNAVAILABLE,
			'verification_unavailable',
			'Verification links cannot be signed'
		)
	}

	let rendered
	try {
		rendered = await renderOnboardingEmailV2(parsed.params, verificationSecret)
	} catch (cause) {
		console.error('Failed to render onboarding email (v2):', cause)
		await reportError(cause, { route: 'onboarding-email/v2' })
		return error(StatusCodes.INTERNAL_SERVER_ERROR, 'render_failed', 'Rendering failed')
	}

	return json({
		version: CONTRACT_VERSION,
		subject: rendered.subject,
		html: rendered.html,
		text: rendered.text,
		language: rendered.language,
		chapter_override: rendered.chapterOverride
	})
}
