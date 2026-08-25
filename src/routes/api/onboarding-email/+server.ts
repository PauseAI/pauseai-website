export const prerender = false

import { ONBOARDING_EMAIL_RENDER_SECRET } from '$env/static/private'
import { renderOnboardingEmail } from '$lib/server/onboardingEmail/index.js'
import { json } from '@sveltejs/kit'
import { StatusCodes } from 'http-status-codes'
import type { RequestHandler } from './$types'

// Render-only endpoint: returns {subject, html, text} for the Airtable onboarding
// automation to send itself via MailerSend's raw /v1/email call. This endpoint never
// sends email and never touches the MailerSend API key — see
// airtable-mailersend-emails.js (repo root) for the caller, which falls back to its
// existing template_id-based send if this endpoint is unreachable or returns
// something unusable.

type RequestBody = {
	first_name?: unknown
	country?: unknown
	intent?: unknown
	languages?: unknown
	airtable_id?: unknown
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0
}

export const POST: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization') ?? ''
	const expected = `Bearer ${ONBOARDING_EMAIL_RENDER_SECRET}`
	// Guard against an unset secret matching an unset header (both `Bearer `).
	if (!ONBOARDING_EMAIL_RENDER_SECRET || authHeader !== expected) {
		return new Response('Unauthorized', { status: StatusCodes.UNAUTHORIZED })
	}

	let body: RequestBody
	try {
		body = (await request.json()) as RequestBody
	} catch {
		return new Response('Invalid JSON body', { status: StatusCodes.BAD_REQUEST })
	}

	if (!isNonEmptyString(body.first_name) || !isNonEmptyString(body.airtable_id)) {
		return new Response('"first_name" and "airtable_id" are required', {
			status: StatusCodes.BAD_REQUEST
		})
	}

	const languages =
		Array.isArray(body.languages) || typeof body.languages === 'string'
			? (body.languages as string[] | string)
			: undefined

	try {
		const rendered = await renderOnboardingEmail({
			firstName: body.first_name,
			country: typeof body.country === 'string' ? body.country : undefined,
			intent: typeof body.intent === 'string' ? body.intent : undefined,
			languages,
			airtable_id: body.airtable_id
		})
		return json(rendered)
	} catch (error) {
		console.error('Failed to render onboarding email:', error)
		return new Response('Failed to render onboarding email', {
			status: StatusCodes.INTERNAL_SERVER_ERROR
		})
	}
}
