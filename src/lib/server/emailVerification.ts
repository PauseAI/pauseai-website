// The signed link in the welcome email that ticks a Members row's `Verified email`.
// The token signs the record id and a hash of the row's current address, and expires. docs/join-form-flow.md,
// "Email verification link", has the format, the rollout and what an unset secret does.
// CiviCRM is to mint the same tokens, so change the format only together with
// emailVerification.vectors.json and the PHP side.

import { env } from '$env/dynamic/private'
import { url, verificationParameter } from '$lib/config.js'
import { getRecord } from '$lib/airtable'
import { MEMBERS_BASE_ID, MEMBERS_TABLE_ID } from '$lib/server/members'
import { isOnboardingLive } from '$lib/server/onboarding'
import { reportError } from '$lib/server/sentry'
import { checkToken, signToken, type TokenVerdict } from '$lib/server/signedToken'

export const LINK_TTL_SECONDS = 90 * 24 * 60 * 60

// A link without a token is what every welcome carried before this date, and what the
// Airtable sender's template fallback still sends. Such a link is accepted for a row
// the sender marked `Sent emails` while the row is younger than LEGACY_WINDOW_DAYS,
// and for any such row until that long after this date. Set once, to the day signed
// links were deployed; never move it later.
export const LEGACY_LINK_CUTOVER = Date.parse('2026-10-07T00:00:00Z')
export const LEGACY_WINDOW_DAYS = 30
const LEGACY_WINDOW_MS = LEGACY_WINDOW_DAYS * 24 * 60 * 60 * 1000

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
		const message =
			'EMAIL_VERIFICATION_SECRET is not set: welcome emails carry unsigned links and /api/verify accepts only those.'
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

/**
 * The link for a welcome being rendered now, signed over the row's current `Email`.
 * Falls back to the unsigned link, which /api/verify still accepts within its window,
 * when there is no secret or the row has no readable address: a welcome without a
 * working link is worse than one without a signature.
 */
export async function signedVerificationLink(recordId: string, now = Date.now()): Promise<string> {
	const key = recordId.replace(/^rec/, '')
	const secret = getVerificationSecret()
	if (!secret) return verificationLink(key)
	const row = await getRecord(MEMBERS_BASE_ID, MEMBERS_TABLE_ID, recordId)
	// getRecord has already reported a failed read.
	if (row === 'failed') return verificationLink(key)
	const email = row === 'missing' ? undefined : row.Email
	if (typeof email !== 'string' || !normaliseEmail(email)) {
		const problem = row === 'missing' ? 'does not exist' : 'has no Email'
		// The record id only, never the link.
		await reportError(new Error(`Verification link left unsigned: the row ${problem}`), {
			recordId
		})
		return verificationLink(key)
	}
	return verificationLink(key, await mintVerificationToken(secret, recordId, email, now))
}

/** Whether a link without a token still verifies this row. */
export function acceptsUnsignedLink(
	row: { createdTime?: string; fields: Record<string, unknown> },
	now: number
): boolean {
	if (row.fields['Sent emails'] !== true) return false
	if (now - LEGACY_LINK_CUTOVER < LEGACY_WINDOW_MS) return true
	const created = Date.parse(row.createdTime ?? '')
	return Number.isFinite(created) && now - created < LEGACY_WINDOW_MS
}
