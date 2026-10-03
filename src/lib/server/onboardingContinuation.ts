// A signed, expiring token that proves the browser posting a `record_id` was
// handed that id by the submit action, so an update can't be aimed at someone
// else's Members row by knowing its id (ids appear in the verification link and
// the Stripe reference, so they are not secret). docs/join-form-flow.md,
// "Continuation token", describes the rollout switch.

import { env } from '$env/dynamic/private'
import { SIGNUP_MAX_AGE_MS } from '$lib/components/onboarding/signupResume'
import { reportError } from '$lib/server/sentry'

const VERSION = 'v1'
// Matches how long the browser keeps the id for a resume.
const TTL_SECONDS = SIGNUP_MAX_AGE_MS / 1000
// HMAC-SHA256 is 32 bytes: 43 base64url characters, unpadded.
const SIGNATURE = /^[A-Za-z0-9_-]{43}$/

type TokenVerdict = 'valid' | 'missing' | 'malformed' | 'expired' | 'invalid'

const encoder = new TextEncoder()

const payload = (recordId: string, expiry: string) =>
	encoder.encode(`onboarding-continuation:${VERSION}:${recordId}:${expiry}`)

const hmacKey = (secret: string, usage: 'sign' | 'verify') =>
	crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
		usage
	])

function toBase64Url(bytes: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(bytes)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
	const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '=')
	return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

export async function mintToken(secret: string, recordId: string, now: number): Promise<string> {
	const expiry = String(Math.floor(now / 1000) + TTL_SECONDS)
	const signature = await crypto.subtle.sign(
		'HMAC',
		await hmacKey(secret, 'sign'),
		payload(recordId, expiry)
	)
	return `${VERSION}.${expiry}.${toBase64Url(signature)}`
}

export async function verifyToken(
	secret: string,
	recordId: string,
	token: string,
	now: number
): Promise<TokenVerdict> {
	if (!token) return 'missing'
	const [version, expiry, signature, ...rest] = token.split('.')
	if (
		version !== VERSION ||
		!/^\d{1,12}$/.test(expiry ?? '') ||
		!SIGNATURE.test(signature ?? '') ||
		rest.length
	) {
		return 'malformed'
	}
	const genuine = await crypto.subtle.verify(
		'HMAC',
		await hmacKey(secret, 'verify'),
		fromBase64Url(signature),
		payload(recordId, expiry)
	)
	if (!genuine) return 'invalid'
	return Number(expiry) * 1000 <= now ? 'expired' : 'valid'
}

let reportedNoSecret = false

function getSecret(): string | undefined {
	const secret = env.ONBOARDING_CONTINUATION_SECRET
	if (secret) return secret
	if (!reportedNoSecret) {
		reportedNoSecret = true
		const ignored =
			env.ONBOARDING_CONTINUATION_ENFORCE === '1'
				? ' ONBOARDING_CONTINUATION_ENFORCE=1 is ignored until it is set.'
				: ''
		console.error(
			`[onboarding] ONBOARDING_CONTINUATION_SECRET is not set: no continuation tokens are issued or checked, so any record id can be updated.${ignored}`
		)
	}
	return undefined
}

// Undefined without a secret, so the form still works; the update check then
// lets everything through.
export async function issueContinuationToken(
	recordId: string,
	now = Date.now()
): Promise<string | undefined> {
	const secret = getSecret()
	return secret ? mintToken(secret, recordId, now) : undefined
}

// Whether an update to `recordId` may go ahead. Until ONBOARDING_CONTINUATION_ENFORCE
// is "1" a bad token is only reported, because a session that started before
// tokens existed holds an id without one for as long as the browser keeps it.
export async function mayContinue(
	recordId: string,
	token: string,
	now = Date.now()
): Promise<boolean> {
	const secret = getSecret()
	if (!secret) return true
	const verdict = await verifyToken(secret, recordId, token, now)
	if (verdict === 'valid') return true
	const enforced = env.ONBOARDING_CONTINUATION_ENFORCE === '1'
	// Never the token or the secret: either would let the reader forge or replay.
	const context = { check: 'onboarding-continuation', verdict, enforced, recordId }
	console.warn('[onboarding] update without a valid continuation token', context)
	await reportError(new Error(`Onboarding continuation token ${verdict}`), context)
	return !enforced
}
