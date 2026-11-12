// The signed link in the welcome email that ticks a Members row's `Verified email`.
// The token signs the record id and a hash of the row's current address, and expires.
// docs/join-form-flow.md, "Email verification link", has the format and what an unset
// secret does. If CiviCRM mints links, it must produce the same tokens, so change the
// format only together with emailVerification.vectors.json and the PHP side.

import { env } from '$env/dynamic/private'
import { url, verificationParameter } from '$lib/config.js'
import { isOnboardingLive } from '$lib/server/onboarding'
import { reportError } from '$lib/server/sentry'
import { checkToken, signToken, type TokenVerdict } from '$lib/server/signedToken'

export const LINK_TTL_SECONDS = 90 * 24 * 60 * 60

/** PHP: strtolower(trim($email, " \t\n\v\f\r")) (strtolower is ASCII-only from PHP 8.2). */
export function normaliseEmail(email: string): string {
	return email
		.replace(/^[ \t\n\v\f\r]+|[ \t\n\v\f\r]+$/g, '')
		.replace(/[A-Z]/g, (letter) => letter.toLowerCase())
}

export async function emailHash(email: string): Promise<string> {
	const digest = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(normaliseEmail(email))
	)
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** What the token signs, before `:<expiry>`. `recordId` is the full `rec…` id, not the link's key. */
export async function verificationPayloadPrefix(recordId: string, email: string): Promise<string> {
	return `email-verification:v1:${recordId}:${await emailHash(email)}`
}

export async function mintVerificationToken(
	secret: string,
	recordId: string,
	email: string,
	now: number
): Promise<string> {
	return signToken(
		secret,
		await verificationPayloadPrefix(recordId, email),
		Math.floor(now / 1000) + LINK_TTL_SECONDS
	)
}

export async function verifyVerificationToken(
	secret: string,
	recordId: string,
	email: string,
	token: string,
	now: number
): Promise<TokenVerdict> {
	return checkToken(secret, await verificationPayloadPrefix(recordId, email), token, now)
}

let reportedNoSecret = false

export function getVerificationSecret(): string | undefined {
	const secret = env.EMAIL_VERIFICATION_SECRET
	if (secret) return secret
	if (!reportedNoSecret) {
		reportedNoSecret = true
		const message = 'EMAIL_VERIFICATION_SECRET is not set: /api/verify refuses every Members link.'
		console.error(`[verification] ${message}`)
		// ONBOARDING_LIVE marks Production, where a dropped secret must not go unnoticed.
		if (isOnboardingLive()) void reportError(new Error(message))
	}
	return undefined
}

/** `key` is the row's `Airtable ID` formula: the record id without its `rec`. */
export function verificationLink(key: string, token?: string): string {
	const link = `${url}/verify?table=join&${verificationParameter}=${key}`
	return token ? `${link}&token=${token}` : link
}
