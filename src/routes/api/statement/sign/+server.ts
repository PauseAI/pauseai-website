export const prerender = false

import {
	readLimitedBody,
	signStatement,
	takeSigningRateLimit,
	type SignatureErrors,
	type SignatureInput
} from '$lib/server/statement'
import { json } from '@sveltejs/kit'
import { StatusCodes } from 'http-status-codes'
import type { RequestHandler } from './$types'

// Public signing endpoint for chapter sites. The contract lives in
// docs/statement-signing-api.md, and it stays the same when signatures move out of Airtable.

// Add a chapter's exact origin (scheme and host, no trailing slash) to let its pages call this.
const CHAPTER_ORIGINS = ['https://pauseai.es']

type SignError =
	| 'origin_not_allowed'
	| 'rate_limited'
	| 'unsupported_media_type'
	| 'payload_too_large'
	| 'invalid_json'
	| 'validation_failed'
	| 'save_failed'

export type SignResponse =
	| { ok: true; status: 'pending_verification' }
	| { ok: false; error: SignError; fields?: SignatureErrors }

const isAllowedOrigin = (origin: string, ownOrigin: string) =>
	origin === ownOrigin || CHAPTER_ORIGINS.includes(origin)

function responseHeaders(origin: string | null, ownOrigin: string): Record<string, string> {
	return {
		'cache-control': 'no-store',
		vary: 'Origin',
		...(origin && isAllowedOrigin(origin, ownOrigin)
			? { 'access-control-allow-origin': origin }
			: {})
	}
}

export const OPTIONS: RequestHandler = ({ request, url }) => {
	const origin = request.headers.get('origin')
	const allowed = !!origin && isAllowedOrigin(origin, url.origin)
	return new Response(null, {
		status: allowed ? StatusCodes.NO_CONTENT : StatusCodes.FORBIDDEN,
		headers: {
			...responseHeaders(origin, url.origin),
			...(allowed
				? {
						'access-control-allow-methods': 'POST, OPTIONS',
						'access-control-allow-headers': 'Content-Type',
						'access-control-max-age': '86400'
					}
				: {})
		}
	})
}

export const POST: RequestHandler = async ({ request, url, getClientAddress }) => {
	const origin = request.headers.get('origin')
	const headers = responseHeaders(origin, url.origin)
	const respond = (status: number, body: SignResponse, extra: Record<string, string> = {}) =>
		json(body, { status, headers: { ...headers, ...extra } })
	const refuse = (status: number, error: SignError, fields?: SignatureErrors) =>
		respond(status, { ok: false, error, ...(fields ? { fields } : {}) })

	// A browser would not show this response to the page anyway. Refusing here also stops a
	// page on another site from sending a signature blind, without reading the answer.
	if (origin && !isAllowedOrigin(origin, url.origin)) {
		return refuse(StatusCodes.FORBIDDEN, 'origin_not_allowed')
	}

	const retryAfter = takeSigningRateLimit(getClientAddress)
	if (retryAfter !== null) {
		return respond(
			StatusCodes.TOO_MANY_REQUESTS,
			{ ok: false, error: 'rate_limited' },
			{ 'retry-after': String(retryAfter) }
		)
	}

	const contentType = request.headers.get('content-type') ?? ''
	if (contentType.split(';')[0].trim().toLowerCase() !== 'application/json') {
		return refuse(StatusCodes.UNSUPPORTED_MEDIA_TYPE, 'unsupported_media_type')
	}

	const bytes = await readLimitedBody(request)
	if (!bytes) return refuse(StatusCodes.REQUEST_TOO_LONG, 'payload_too_large')

	let body: unknown
	try {
		body = JSON.parse(new TextDecoder().decode(bytes))
	} catch {
		return refuse(StatusCodes.BAD_REQUEST, 'invalid_json')
	}
	if (typeof body !== 'object' || body === null || Array.isArray(body)) {
		return refuse(StatusCodes.BAD_REQUEST, 'invalid_json')
	}

	const result = await signStatement(body as SignatureInput)
	switch (result.status) {
		case 'accepted':
			return respond(StatusCodes.ACCEPTED, { ok: true, status: 'pending_verification' })
		case 'invalid':
			return refuse(StatusCodes.BAD_REQUEST, 'validation_failed', result.errors)
		case 'failed':
			return refuse(StatusCodes.BAD_GATEWAY, 'save_failed')
	}
}
