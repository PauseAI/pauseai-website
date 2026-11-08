// The one path every statement signature takes: the /statement form
// (routes/statement/sign) and the public endpoint for chapter sites
// (routes/api/statement/sign, documented in docs/statement-signing-api.md).
//
// Whether a signature is listed is decided elsewhere: /api/signatories only returns rows
// with email_verified ticked and duplicate unticked. Nothing here ticks email_verified.
// An Airtable automation emails each new row a /verify?table=statement link, and
// /api/verify ticks the box. Nothing here looks up earlier signatures either, so a
// response cannot reveal whether an address has already signed.
//
// Emails and other submitted values must never reach a log or a response.
import { createRecord } from '$lib/airtable'
import { COUNTRIES } from '$lib/components/onboarding/options'
import { MEMBERS_BASE_ID, STATEMENT_TABLE_ID } from '$lib/server/members'
import { isOnboardingLive } from '$lib/server/onboarding'
import { takeRateLimit } from '$lib/server/rateLimit'

export const MAX_NAME_LENGTH = 200
export const MAX_EMAIL_LENGTH = 254
export const MAX_BIO_LENGTH = 2000
// Roomy enough for the longest valid bio with every character escaped, plus a Turnstile token.
export const MAX_BODY_BYTES = 32 * 1024

// Far above one person signing, and low enough to slow a script. Both are per edge isolate
// (see rateLimit.ts). The overall limit is a backstop for traffic from many addresses.
const SENDER_LIMIT = { attempts: 10, windowMs: 10 * 60 * 1000 }
const OVERALL_LIMIT = { attempts: 120, windowMs: 60 * 1000 }

export type SignatureField = 'name' | 'email' | 'country' | 'bio' | 'private'
export type SignatureFieldError = 'required' | 'invalid' | 'too_long'
export type SignatureErrors = Partial<Record<SignatureField, SignatureFieldError>>

/** Untrusted values, from a form post or a JSON body. */
export type SignatureInput = Partial<Record<SignatureField | 'honeypot', unknown>>

type Signature = {
	name: string
	email: string
	country: string
	bio: string
	private: boolean
}

export type SignResult =
	{ status: 'accepted' } | { status: 'invalid'; errors: SignatureErrors } | { status: 'failed' }

const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export function validateSignature(
	input: SignatureInput
): { ok: true; signature: Signature } | { ok: false; errors: SignatureErrors } {
	const errors: SignatureErrors = {}

	const name = asText(input.name).replace(/\s+/g, ' ')
	if (!name) errors.name = 'required'
	else if (name.length > MAX_NAME_LENGTH) errors.name = 'too_long'
	else if (/\p{Cc}/u.test(name)) errors.name = 'invalid'

	const email = asText(input.email)
	if (!email) errors.email = 'required'
	else if (email.length > MAX_EMAIL_LENGTH) errors.email = 'too_long'
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'invalid'

	// Airtable's country field is a single select, and createRecord's typecast would add
	// any new value as an option, so only names from the shared list get through.
	const country = asText(input.country)
	if (!country) errors.country = 'required'
	else if (!COUNTRIES.includes(country)) errors.country = 'invalid'

	if (input.bio !== undefined && input.bio !== null && typeof input.bio !== 'string') {
		errors.bio = 'invalid'
	}
	const bio = asText(input.bio).replace(/\r\n?/g, '\n')
	if (bio.length > MAX_BIO_LENGTH) errors.bio = 'too_long'

	// Strictly a boolean: reading a mistyped value as false would publish the name of
	// someone who asked to stay anonymous.
	if (input.private === undefined || input.private === null) errors.private = 'required'
	else if (typeof input.private !== 'boolean') errors.private = 'invalid'

	if (Object.keys(errors).length > 0) return { ok: false, errors }
	return { ok: true, signature: { name, email, country, bio, private: input.private === true } }
}

/**
 * Stores a validated signature, returning whether it was saved. The only part that knows
 * where signatures live: moving them to CiviCRM means replacing this function.
 */
async function saveSignature(signature: Signature): Promise<boolean> {
	const written = await createRecord(
		MEMBERS_BASE_ID,
		STATEMENT_TABLE_ID,
		{
			name: signature.name,
			email: signature.email,
			country: signature.country,
			private: signature.private,
			...(signature.bio ? { bio: signature.bio } : {})
		},
		{ redactErrors: true }
	)
	return written !== undefined
}

/**
 * Validates and saves one signature. A filled honeypot gets the same answer as a real
 * signature, so a bot does not learn it was caught.
 */
export async function signStatement(input: SignatureInput): Promise<SignResult> {
	if (input.honeypot) return { status: 'accepted' }

	const validated = validateSignature(input)
	if (!validated.ok) return { status: 'invalid', errors: validated.errors }

	// ONBOARDING_LIVE is only set in Netlify's production context, so a deploy preview or a
	// local server must not write to the real table.
	if (!isOnboardingLive()) {
		console.log('[statement] not live: signature accepted without saving')
		return { status: 'accepted' }
	}

	return (await saveSignature(validated.signature)) ? { status: 'accepted' } : { status: 'failed' }
}

/** Counts one attempt to sign. Returns the seconds to wait when over a limit, else null. */
export function takeSigningRateLimit(getClientAddress: () => string): number | null {
	let sender = 'unknown'
	try {
		sender = getClientAddress()
	} catch {
		// Addresses without one share a counter, which errs towards limiting.
	}
	return (
		takeRateLimit(`statement:${sender}`, SENDER_LIMIT.attempts, SENDER_LIMIT.windowMs) ??
		takeRateLimit('statement:overall', OVERALL_LIMIT.attempts, OVERALL_LIMIT.windowMs)
	)
}

/** Reads a request body, or returns null once it passes MAX_BODY_BYTES. */
export async function readLimitedBody(request: Request): Promise<Uint8Array | null> {
	const declared = Number(request.headers.get('content-length'))
	if (declared > MAX_BODY_BYTES) return null
	if (!request.body) return new Uint8Array()

	const reader = request.body.getReader()
	const chunks: Uint8Array[] = []
	let total = 0
	for (;;) {
		const { done, value } = await reader.read()
		if (done) break
		total += value.byteLength
		if (total > MAX_BODY_BYTES) {
			await reader.cancel()
			return null
		}
		chunks.push(value)
	}
	const body = new Uint8Array(total)
	let offset = 0
	for (const chunk of chunks) {
		body.set(chunk, offset)
		offset += chunk.byteLength
	}
	return body
}
