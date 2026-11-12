import { dev } from '$app/env';
import { TURNSTILE_SECRET_KEY } from '$app/env/private';
import { reportError } from '$lib/server/sentry';
import { TURNSTILE_FIELD } from '$lib/turnstile';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
// Leaves the rest of an edge function's response limit to the work the check guards. A
// timeout is answered like any other failure to reach Cloudflare: unavailable, retry later.
export const TURNSTILE_TIMEOUT_MS = 5000

// Cloudflare's codes for a fault on the server side, not with the person's token. Telling
// them to retry would loop forever on our wrong secret, with nobody alerted.
const MISCONFIGURED_CODES = ['missing-input-secret', 'invalid-input-secret'];

const CLOUDFLARE_FAULT_CODES = ['internal-error'];
const UNAVAILABLE_MESSAGE = 'Spam protection is unavailable. Please email contact@pauseai.info instead.';
const RETRY_LATER_MESSAGE = 'Could not complete the anti-spam check. Please try again in a moment.';

const errorCodes = (result: TurnstileVerification): string[] => Array.isArray(result['error-codes'])
	? result['error-codes'].filter((code): code is string => typeof code === 'string')
		: []

/**
 * Cloudflare's dummy test secrets (1x…/2x…/3x… followed by zeros), which pass or fail
 * every token regardless of the challenge. Real secrets begin "0x".
 * We reject the known-bad prefixes rather than requiring a known-good format, so a
 * future change to Cloudflare's real key format cannot lock legitimate senders out.
 */
const TURNSTILE_TEST_SECRET = /^[123]x0{10}/

type TurnstileVerification = { success?: boolean; hostname?: unknown; 'error-codes'?: unknown }

function isTurnstileVerification(value: unknown): value is TurnstileVerification {
	return typeof value === 'object' && value !== null
}

function getFormString(formData: FormData, field: string): string | undefined {
	const value = formData.get(field)
	return typeof value === 'string' ? value : undefined
}

/**
 * Verifies the Cloudflare Turnstile token server-side. This is the check that
 * matters — the honeypot only catches bots that render the page, whereas most
 * spam POSTs directly to the form action.
 */
export async function verifyTurnstile(
	token: string | undefined,
	expectedHostname: string | readonly string[]
): Promise<
	{ ok: true } |
	{ ok: false; message: string; unavailable?: true }> {
	const expectedHostnames = typeof expectedHostname === 'string' ? [expectedHostname] : expectedHostname;
	const secret = TURNSTILE_SECRET_KEY;

	if (!secret) {
		// `dev` (not isDev()) on purpose: it is compiled to a constant false in any
		// build, so whether we fail closed does not depend on which env vars the
		// runtime happens to expose. isDev() keys off CI at request time, which is
		// too fragile a basis for a security decision.
		if (dev) {
			console.warn('⚠️ TURNSTILE_SECRET_KEY not set — skipping anti-spam check in development')
			return { ok: true }
		}
		// Fail closed: a misconfigured deploy must not silently reopen the form to bots.
		console.error('TURNSTILE_SECRET_KEY is not configured')
		await reportError(new Error('TURNSTILE_SECRET_KEY is not configured'))
		return { ok: false, unavailable: true, message: UNAVAILABLE_MESSAGE }
	}

	// Fail closed on a *wrong* secret as well as a missing one. A test secret accepts
	// every token, which would silently turn the form back into an open mail relay
	// while every health check still looked green.
	if (!dev && TURNSTILE_TEST_SECRET.test(secret)) {
		console.error('TURNSTILE_SECRET_KEY is a Cloudflare test key — refusing it outside dev')
		await reportError(new Error('TURNSTILE_SECRET_KEY is a Cloudflare test key'))
		return {
			ok: false,
			unavailable: true,
			message: 'Spam protection is misconfigured. Please email contact@pauseai.info instead.'
		}
	}

	if (!token) {
		return {
			ok: false,
			message: 'Please wait for the anti-spam check to complete, then send your message again.'
		}
	}

	try {
		const response = await fetch(TURNSTILE_VERIFY_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ secret, response: token }),
			signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS)
		})

		const result: unknown = await response.json()

		if (isTurnstileVerification(result) && result.success === true) {
			// Reject a token minted on another origin (a deploy preview, say) and replayed
			// here. Only reject when Turnstile actually reports a different hostname — an
			// absent or unexpected field must never lock out legitimate senders.
			const hostname = typeof result.hostname === 'string' ? result.hostname : undefined
			if (!dev && hostname && !expectedHostnames.includes(hostname)) {
				console.warn(
					`Turnstile token was issued for ${hostname}, but submitted to ${expectedHostnames.join(', ')}`
				)
				return {
					ok: false,
					message: 'The anti-spam check failed. Please reload the page and try again.'
				}
			}
			return { ok: true }
		}

		const codes = isTurnstileVerification(result) ? errorCodes(result) : []
		const misconfigured = codes.some((code) => MISCONFIGURED_CODES.includes(code))
		if (misconfigured || codes.some((code) => CLOUDFLARE_FAULT_CODES.includes(code))) {
			console.error('Turnstile could not check a token:', codes)
			await reportError(new Error(`Turnstile could not check a token: ${codes.join(', ')}`))
			return {
				ok: false,
				unavailable: true,
				message: misconfigured ? UNAVAILABLE_MESSAGE : RETRY_LATER_MESSAGE
			}
		}

		console.warn(
			'Turnstile rejected a submission:',
			isTurnstileVerification(result) ? result['error-codes'] : result
		)
		return {
			ok: false,
			message: 'The anti-spam check failed. Please reload the page and try again.'
		}
	} catch (error) {
		console.error('Turnstile verification error:', error)
		await reportError(error, { operation: 'verifyTurnstile' })
		return { ok: false, unavailable: true, message: RETRY_LATER_MESSAGE }
	}
}

/**
 * The anti-bot gate shared by every form, cheapest check first.
 * `drop` means silently pretend success, so a bot does not learn it was caught.
 */
export async function checkNotSpam(
	data: FormData,
	expectedHostname: string
): Promise<{ drop: true } | { drop: false; message?: string }> {
	// Hidden field that only an automated form-filler completes.
	if (getFormString(data, 'nickname')) return { drop: true }

	const verification = await verifyTurnstile(getFormString(data, TURNSTILE_FIELD), expectedHostname);

	if (!verification.ok) return { drop: false, message: verification.message };

	return { drop: false };
}
