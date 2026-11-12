import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}

vi.mock('$app/environment', () => ({ dev: false }))
vi.mock('$env/dynamic/private', () => ({ env }))
const reportError = vi.fn()
vi.mock('#lib/server/sentry.ts', () => ({ reportError }))

const { TURNSTILE_TIMEOUT_MS, verifyTurnstile } = await import('./turnstile-verify')

const HOSTNAMES = ['pauseai.info', 'pauseai.es']

function cloudflareAnswers(answer: Record<string, unknown>) {
	vi.stubGlobal(
		'fetch',
		vi.fn(() => Promise.resolve(new Response(JSON.stringify(answer))))
	)
}

beforeEach(() => {
	env.TURNSTILE_SECRET_KEY = '0xnot-a-test-key'
	reportError.mockReset()
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('verifyTurnstile', () => {
	it.each(HOSTNAMES)('accepts a token issued on %s', async (hostname) => {
		cloudflareAnswers({ success: true, hostname })

		expect(await verifyTurnstile('a-token', HOSTNAMES)).toEqual({ ok: true })
	})

	it.each(['evil.example', 'pauseai.es.evil.example', 'www.pauseai.es'])(
		'refuses a token issued on %s',
		async (hostname) => {
			cloudflareAnswers({ success: true, hostname })
			const result = await verifyTurnstile('a-token', HOSTNAMES)

			expect(result.ok).toBe(false)
			expect(result).not.toHaveProperty('unavailable')
		}
	)

	it('still takes a single hostname, for the other forms', async () => {
		cloudflareAnswers({ success: true, hostname: 'pauseai.es' })

		expect((await verifyTurnstile('a-token', 'pauseai.info')).ok).toBe(false)
		expect(await verifyTurnstile('a-token', 'pauseai.es')).toEqual({ ok: true })
	})

	it('refuses a missing token without calling Cloudflare', async () => {
		const fetch = vi.fn()
		vi.stubGlobal('fetch', fetch)
		const result = await verifyTurnstile(undefined, HOSTNAMES)

		expect(result.ok).toBe(false)
		expect(result).not.toHaveProperty('unavailable')
		expect(fetch).not.toHaveBeenCalled()
	})

	it('refuses a token Cloudflare rejects, as a failure and not an outage', async () => {
		cloudflareAnswers({ success: false, 'error-codes': ['invalid-input-response'] })
		const result = await verifyTurnstile('a-token', HOSTNAMES)

		expect(result.ok).toBe(false)
		expect(result).not.toHaveProperty('unavailable')
		expect(reportError).not.toHaveBeenCalled()
	})

	it.each(['timeout-or-duplicate', 'invalid-input-response', 'missing-input-response'])(
		"treats %s as the person's token, without alerting anyone",
		async (code) => {
			cloudflareAnswers({ success: false, 'error-codes': [code] })
			const result = await verifyTurnstile('a-token', HOSTNAMES)

			expect(result).not.toHaveProperty('unavailable')
			expect(reportError).not.toHaveBeenCalled()
		}
	)

	it.each(['invalid-input-secret', 'missing-input-secret', 'internal-error'])(
		'reports %s as an outage rather than the fault of the token',
		async (code) => {
			cloudflareAnswers({ success: false, 'error-codes': [code] })

			expect(await verifyTurnstile('a-token', HOSTNAMES)).toMatchObject({
				ok: false,
				unavailable: true
			})
			expect(reportError).toHaveBeenCalledOnce()
		}
	)

	it('gives Cloudflare TURNSTILE_TIMEOUT_MS, then answers unavailable', async () => {
		const timeout = vi
			.spyOn(AbortSignal, 'timeout')
			.mockReturnValue(AbortSignal.abort(new DOMException('', 'TimeoutError')))
		vi.stubGlobal(
			'fetch',
			vi.fn((_url: string, init: RequestInit) => Promise.reject(init.signal?.reason as Error))
		)

		expect(await verifyTurnstile('a-token', HOSTNAMES)).toMatchObject({
			ok: false,
			unavailable: true
		})
		expect(timeout).toHaveBeenCalledExactlyOnceWith(TURNSTILE_TIMEOUT_MS)
	})

	it('tells people not to keep retrying a wrong secret', async () => {
		cloudflareAnswers({ success: false, 'error-codes': ['invalid-input-secret'] })

		const result = await verifyTurnstile('a-token', HOSTNAMES)

		expect(result.ok ? '' : result.message).toContain('contact@pauseai.info')
	})

	it('never sends the secret or the token to Sentry', async () => {
		cloudflareAnswers({ success: false, 'error-codes': ['invalid-input-secret'] })
		await verifyTurnstile('a-token', HOSTNAMES)

		const reported = String(reportError.mock.calls[0][0])
		expect(reported).not.toContain('0xnot-a-test-key')
		expect(reported).not.toContain('a-token')
	})

	it.each([
		['no secret', () => (env.TURNSTILE_SECRET_KEY = undefined)],
		[
			'a Cloudflare test secret',
			// Cloudflare's public dummy. Built here as previews have it as their secret, so
			// Netlify's secrets scan fails the build if it's written out in full.
			() => (env.TURNSTILE_SECRET_KEY = `1x${'0'.repeat(31)}AA`)
		],
		[
			'Cloudflare out of reach',
			() =>
				vi.stubGlobal(
					'fetch',
					vi.fn(() => Promise.reject(new Error('down')))
				)
		]
	])('fails closed, as unavailable, with %s', async (_label, arrange) => {
		arrange()

		expect(await verifyTurnstile('a-token', HOSTNAMES)).toMatchObject({
			ok: false,
			unavailable: true
		})
		expect(reportError).toHaveBeenCalledOnce()
	})
})
