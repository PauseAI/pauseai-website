// The one path every statement signature takes: the /statement form
// (routes/statement/sign) and the public endpoint for chapter sites
// (routes/api/statement/sign, documented in docs/statement-signing-api.md).
//
// Whether a signature is listed is decided elsewhere: /api/signatories only returns rows
// with email_verified ticked and duplicate unticked, once per address. Nothing here ticks
// email_verified. An Airtable automation emails each new row a /verify?table=statement
// link, and /api/verify ticks the box after the person confirms on that page.
//
// A repeat signature writes nothing, so sends no email, and gets the same answer as a new
// one, so a response cannot reveal whether an address has already signed.
//
// Emails and other submitted values must never reach a log or a response.
import { dev } from '$app/environment'
import { env } from '$env/dynamic/private'
import { airtableFormulaString, createRecord, hasMatchingRecord } from '$lib/airtable'
import { COUNTRIES } from '$lib/components/onboarding/options'
import { normaliseEmail } from '$lib/server/emailVerification'
import { MEMBERS_BASE_ID, STATEMENT_TABLE_ID } from '$lib/server/members'
import {
	peekRateLimit,
	rateLimitKeyForAddress,
	recordRateLimit,
	takeRateLimit
} from '$lib/server/rateLimit'
import { verifyTurnstile } from '$lib/server/turnstile-verify'

export const MAX_NAME_LENGTH = 200
const MAX_EMAIL_LENGTH = 254
export const MAX_BIO_LENGTH = 2000
// Roomy enough for the longest valid bio with every character escaped, plus a Turnstile token.
const MAX_BODY_BYTES = 32 * 1024

// Both limits are per edge isolate, so neither is a hard limit (see rateLimit.ts), and both
// only see requests that passed Turnstile, so traffic without a token cannot use them up.
//
// Counts saves per address, not attempts: mistakes and failures cost nothing, and a room
// of people on shared Wi-Fi can all sign.
const SAVE_LIMIT = { saves: 30, windowMs: 10 * 60 * 1000 }
// Protects Airtable: each of these makes up to two calls, against 5 a second per base.
const OVERALL_LIMIT = { attempts: 120, windowMs: 60 * 1000 }

// A repeat within this long writes nothing and sends no email. It is also the most email
// someone else can cause one address to receive, and how long a signer who lost the first
// email has to wait for another. Older than this, a new row and email are allowed, and
// /api/signatories still lists the address once.
const REPEAT_WINDOW_DAYS = 30

// A repeat skips Airtable's write, so would answer measurably sooner than a new signature.
// Roughly a write's duration, which narrows that gap for someone probing an address but
// does not close it: each probe needs its own solved Turnstile token.
const REPEAT_DELAY_MS = { minimum: 150, spread: 300 }

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
	| { status: 'accepted' }
	| { status: 'dry_run' }
	| { status: 'invalid'; errors: SignatureErrors }
	| { status: 'unavailable' }
	| { status: 'turnstile_failed'; message: string }
	| { status: 'turnstile_unavailable'; message: string }
	| { status: 'rate_limited'; retryAfter: number }
	| { status: 'failed' }

export type SigningMode = 'live' | 'dry_run' | 'off'

/**
 * Whether signatures are written. STATEMENT_SIGNING_LIVE is meant for Netlify's production
 * context only. Without it:
 * - local servers and deploy previews validate but write and email nothing, and need no
 *   Turnstile token, since a preview's hostname can't produce one
 * - anywhere else, which means the real site, signing refuses visibly: saying thanks with
 *   nothing saved would lose the signature without anyone noticing
 */
export function signingMode(hostname: string): SigningMode {
	if (env.STATEMENT_SIGNING_LIVE === 'true') return 'live'
	const isTestHost =
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '[::1]' ||
		hostname.endsWith('.netlify.app')
	return dev || isTestHost ? 'dry_run' : 'off'
}

const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const CONTROL_CHARACTER = /\p{Cc}/u
// Everything \p{Cc} covers except the tab and line breaks a multi-line bio can hold.
const CONTROL_CHARACTER_IN_TEXT = /[^\P{Cc}\t\n\r]/u
// Overrides, embeddings and isolates, which can make text display as something else. Not
// the left-to-right and right-to-left marks or zero-width joiners real text in Arabic,
// Hebrew and Indic scripts uses.
const BIDI_CONTROL = /[‪-‮⁦-⁩]/u
const EMAIL = /^[^\s@,;<>"\p{Cc}‪-‮⁦-⁩]+@[^\s@,;<>"\p{Cc}‪-‮⁦-⁩]+\.[^\s@,;<>"\p{Cc}‪-‮⁦-⁩]+$/u

const URL_SCHEME = /[a-z][a-z0-9+.-]*:\/\/|\b(?:https?|mailto|ftp):/iu
const IP_ADDRESS = /\b\d{1,3}(?:\.\d{1,3}){3}\b/u
const TITLE = /^(?:dr|mr|mrs|ms|mx|st|jr|sr|prof|rev)$/iu

/**
 * A word ending in two or more characters, a dot and two or more letters: example.com, or
 * пример.рф. Initials and letters after a name have one side shorter (J.R. Smith, Ph.D,
 * S.Ramesh). Titles written without a space (Dr.Smith, Prof.Dr.) would look the same, so
 * they are let through by name, at the cost of a domain like dr.com.
 */
function looksLikeDomain(word: string): boolean {
	const labels = word
		.split(/[/?#:]/)[0]
		.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
		.split(/[.。．｡]/u)
	if (labels.length < 2) return false
	const [last, secondLast] = [labels[labels.length - 1], labels[labels.length - 2]]
	return (
		/^\p{L}{2,}$/u.test(last) &&
		secondLast.length >= 2 &&
		!TITLE.test(secondLast) &&
		!TITLE.test(last)
	)
}

// The name may be quoted in the verification email, where a link would make that email a
// way to send anyone a link from PauseAI.
const containsUrl = (name: string) =>
	URL_SCHEME.test(name) || IP_ADDRESS.test(name) || name.split(/[\s,;]+/).some(looksLikeDomain)

function validateSignature(
	input: SignatureInput
): { ok: true; signature: Signature } | { ok: false; errors: SignatureErrors } {
	const errors: SignatureErrors = {}

	const rawName = asText(input.name)
	const name = rawName.replace(/\s+/g, ' ')
	if (!name) errors.name = 'required'
	else if (name.length > MAX_NAME_LENGTH) errors.name = 'too_long'
	else if (CONTROL_CHARACTER.test(rawName) || BIDI_CONTROL.test(name) || containsUrl(name)) {
		errors.name = 'invalid'
	}

	const email = asText(input.email)
	if (!email) errors.email = 'required'
	else if (email.length > MAX_EMAIL_LENGTH) errors.email = 'too_long'
	else if (!EMAIL.test(email)) errors.email = 'invalid'

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
	else if (CONTROL_CHARACTER_IN_TEXT.test(bio) || BIDI_CONTROL.test(bio)) errors.bio = 'invalid'

	// Strictly a boolean: reading a mistyped value as false would publish the name of
	// someone who asked to stay anonymous.
	if (input.private === undefined || input.private === null) errors.private = 'required'
	else if (typeof input.private !== 'boolean') errors.private = 'invalid'

	if (Object.keys(errors).length > 0) return { ok: false, errors }
	return { ok: true, signature: { name, email, country, bio, private: input.private === true } }
}

/**
 * Stores a validated signature, unless the address signed recently, returning false if it
 * could not. The signing half of what knows signatures live in Airtable: a move to CiviCRM
 * replaces this, and also /api/signatories, /api/verify and the email automation.
 *
 * Costs one extra Airtable read per signature that gets this far. A failed lookup refuses
 * the signature rather than writing it, as Airtable is likely down and the person can retry
 * with what they typed, whereas a write could send a repeat email.
 *
 * Uses Airtable's own row creation time rather than `date`. That is a formula field, so
 * the write below must leave it out, or Airtable refuses every save.
 */
async function saveSignature(signature: Signature): Promise<boolean> {
	const repeat = await hasMatchingRecord(
		MEMBERS_BASE_ID,
		STATEMENT_TABLE_ID,
		`AND(LOWER(TRIM({email})) = ${airtableFormulaString(normaliseEmail(signature.email))}, ` +
			`IS_AFTER(CREATED_TIME(), DATEADD(NOW(), -${REPEAT_WINDOW_DAYS}, 'days')))`,
		'email_verified'
	)
	if (repeat === 'failed') return false
	if (repeat) {
		const delay = REPEAT_DELAY_MS.minimum + Math.random() * REPEAT_DELAY_MS.spread
		await new Promise((resolve) => setTimeout(resolve, delay))
		return true
	}

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

type SignContext = {
	/** The hostname this request came to, which decides the signing mode. */
	hostname: string
	/** Where a Turnstile token may have been issued for this path. */
	allowedHostnames: readonly string[]
	turnstileToken: unknown
	getClientAddress: () => string
}

function senderKey(getClientAddress: () => string): string {
	try {
		return `statement:saves:${rateLimitKeyForAddress(getClientAddress())}`
	} catch {
		// Requests without an address share a counter, which errs towards limiting.
		return 'statement:saves:unknown'
	}
}

/**
 * Validates and saves one signature, in order of cost, so nothing unverified reaches a
 * rate limit or Airtable. A filled honeypot gets the same answer as a real signature, so
 * a bot does not learn it was caught.
 */
export async function signStatement(
	input: SignatureInput,
	context: SignContext
): Promise<SignResult> {
	const mode = signingMode(context.hostname)
	if (mode === 'off') {
		console.error('[statement] STATEMENT_SIGNING_LIVE is not set: refusing a signature')
		return { status: 'unavailable' }
	}

	if (input.honeypot) return { status: 'accepted' }

	const validated = validateSignature(input)
	if (!validated.ok) return { status: 'invalid', errors: validated.errors }

	if (mode === 'dry_run') {
		console.log('[statement] dry run: signature checked, not saved, and no email sent')
		return { status: 'dry_run' }
	}

	const token = typeof context.turnstileToken === 'string' ? context.turnstileToken : undefined
	const verification = await verifyTurnstile(token, context.allowedHostnames)
	if (!verification.ok) {
		return {
			status: verification.unavailable ? 'turnstile_unavailable' : 'turnstile_failed',
			message: verification.message
		}
	}

	const sender = senderKey(context.getClientAddress)
	const retryAfter =
		peekRateLimit(sender, SAVE_LIMIT.saves) ??
		takeRateLimit('statement:overall', OVERALL_LIMIT.attempts, OVERALL_LIMIT.windowMs)
	if (retryAfter !== null) return { status: 'rate_limited', retryAfter }

	if (!(await saveSignature(validated.signature))) return { status: 'failed' }

	// A skipped repeat counts too, or the limit would reveal which addresses have signed.
	recordRateLimit(sender, SAVE_LIMIT.windowMs)
	return { status: 'accepted' }
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
