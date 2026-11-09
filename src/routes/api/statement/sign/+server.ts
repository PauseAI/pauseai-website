export const prerender = false

import {
	readLimitedBody,
	signingMode,
	signStatement,
	type SignatureErrors,
	type SigningMode
} from '$lib/server/statement'
import { TURNSTILE_FIELD } from '$lib/turnstile'
import { json } from '@sveltejs/kit'
import { StatusCodes } from 'http-status-codes'
import type { RequestHandler } from './$types'

// Public signing endpoint for chapter sites. The contract lives in
// docs/statement-signing-api.md, and it stays the same when signatures move out of Airtable.

// Add a chapter's exact origin (scheme and host, no trailing slash) to let its pages call
// this, and its hostname to the Turnstile widget in Cloudflare. Its hostname is then also
// accepted on tokens, which is what binds a caller that isn't a browser.
const CHAPTER_ORIGINS = ['https://pauseai.es']

type SignError =
	| 'origin_not_allowed'
	| 'turnstile_failed'
	| 'turnstile_unavailable'
	| 'rate_limited'
	| 'unsupported_media_type'
	| 'payload_too_large'
	| 'invalid_json'
	| 'validation_failed'
	| 'save_failed'
	| 'signing_unavailable'

export type SignResponse =
	| { ok: true; status: 'pending_verification'; dry_run?: true }
	| { ok: false; error: SignError; fields?: SignatureErrors }

export type SigningModeResponse = { mode: SigningMode }

const isAllowedOrigin = (origin: string, ownOrigin: string) =>
	origin === ownOrigin || CHAPTER_ORIGINS.includes(origin)

function responseHeaders(
	origin: string | null,
	ownOrigin: string,
	cacheControl = 'no-store'
): Record<string, string> {
	return {
		'cache-control': cacheControl,
		vary: 'Origin',
		...(origin && isAllowedOrigin(origin, ownOrigin)
			? {
					'access-control-allow-origin': origin,
					'access-control-expose-headers': 'Retry-After'
				}
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
						'access-control-allow-methods': 'GET, POST, OPTIONS',
						'access-control-allow-headers': 'Content-Type',
						'access-control-max-age': '86400'
					}
				: {})
		}
	})
}

// Tells a form whether signing works here before anyone fills it in, and whether to show
// Turnstile, which only runs when a signature would be written. The mode depends only on
// env and the hostname, which is part of the cache key, so it can be cached briefly.
export const GET: RequestHandler = ({ request, url }) => {
	const body: SigningModeResponse = { mode: signingMode(url.hostname) }
	return json(body, {
		headers: responseHeaders(request.headers.get('origin'), url.origin, 'public, max-age=300')
	})
}

export const POST: RequestHandler = async ({ request, url, getClientAddress }) => {
	const origin = request.headers.get('origin')
	const headers = responseHeaders(origin, url.origin)
	const respond = (status: number, body: SignResponse, extra: Record<string, string> = {}) =>
		json(body, { status, headers: { ...headers, ...extra } })
	const refuse = (status: number, error: SignError, fields?: SignatureErrors) =>
		respond(status, { ok: false, error, ...(fields ? { fields } : {}) })

	// Stops a page on another site from sending a signature blind. Only browsers send an
	// Origin, and anything else can leave it out or forge it, so this is not what protects
	// the endpoint: the Turnstile token, checked below for every caller, is.
	if (origin && !isAllowedOrigin(origin, url.origin)) {
		return refuse(StatusCodes.FORBIDDEN, 'origin_not_allowed')
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

	const result = await signStatement(body, {
		hostname: url.hostname,
		allowedHostnames: [
			url.hostname,
			...CHAPTER_ORIGINS.map((chapterOrigin) => new URL(chapterOrigin).hostname)
		],
		turnstileToken: (body as Record<string, unknown>)[TURNSTILE_FIELD],
		getClientAddress
	})
	switch (result.status) {
		case 'accepted':
			return respond(StatusCodes.ACCEPTED, { ok: true, status: 'pending_verification' })
		case 'dry_run':
			return respond(StatusCodes.ACCEPTED, {
				ok: true,
				status: 'pending_verification',
				dry_run: true
			})
		case 'invalid':
			return refuse(StatusCodes.BAD_REQUEST, 'validation_failed', result.errors)
		case 'unavailable':
			return refuse(StatusCodes.SERVICE_UNAVAILABLE, 'signing_unavailable')
		case 'turnstile_failed':
			return refuse(StatusCodes.FORBIDDEN, 'turnstile_failed')
		case 'turnstile_unavailable':
			return refuse(StatusCodes.SERVICE_UNAVAILABLE, 'turnstile_unavailable')
		case 'rate_limited':
			return respond(
				StatusCodes.TOO_MANY_REQUESTS,
				{ ok: false, error: 'rate_limited' },
				{ 'retry-after': String(result.retryAfter) }
			)
		case 'failed':
			return refuse(StatusCodes.BAD_GATEWAY, 'save_failed')
	}
}
