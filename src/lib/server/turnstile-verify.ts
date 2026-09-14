import { dev } from '$app/environment'
import { env } from '$env/dynamic/private'
import { TURNSTILE_FIELD } from '$lib/turnstile'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

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
async function verifyTurnstile(
	token: string | undefined,
	expectedHostname: string
): Promise<{ ok: true } | { ok: false; message: string }> {
	const secret = env.TURNSTILE_SECRET_KEY

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
		return {
			ok: false,
			message: 'Spam protection is unavailable. Please email contact@pauseai.info instead.'
		}
	}

	// Fail closed on a *wrong* secret as well as a missing one. A test secret accepts
	// every token, which would silently turn the form back into an open mail relay
	// while every health check still looked green.
	if (!dev && TURNSTILE_TEST_SECRET.test(secret)) {
		console.error('TURNSTILE_SECRET_KEY is a Cloudflare test key — refusing it outside dev')
		return {
			ok: false,
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
			body: new URLSearchParams({ secret, response: token })
		})

		const result: unknown = await response.json()

		if (isTurnstileVerification(result) && result.success === true) {
			// Reject a token minted on another origin (a deploy preview, say) and replayed
			// here. Only reject when Turnstile actually reports a different hostname — an
			// absent or unexpected field must never lock out legitimate senders.
			const hostname = typeof result.hostname === 'string' ? result.hostname : undefined
			if (!dev && hostname && hostname !== expectedHostname) {
				console.warn(
					`Turnstile token was issued for ${hostname}, but submitted to ${expectedHostname}`
				)
				return {
					ok: false,
					message: 'The anti-spam check failed. Please reload the page and try again.'
				}
			}
			return { ok: true }
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
		return {
			ok: false,
			message: 'Could not complete the anti-spam check. Please try again in a moment.'
		}
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

	const verification = await verifyTurnstile(getFormString(data, TURNSTILE_FIELD), expectedHostname)
	if (!verification.ok) return { drop: false, message: verification.message }

	return { drop: false }
}
