import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}

vi.mock('$app/environment', () => ({ dev: false }))
vi.mock('$env/dynamic/private', () => ({ env }))

const { verifyTurnstile } = await import('./turnstile-verify')

const HOSTNAMES = ['pauseai.info', 'pauseai.es']

function cloudflareAnswers(answer: Record<string, unknown>) {
	vi.stubGlobal(
		'fetch',
		vi.fn(() => Promise.resolve(new Response(JSON.stringify(answer))))
	)
}

beforeEach(() => {
	env.TURNSTILE_SECRET_KEY = '0xnot-a-test-key'
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
	})

	it.each([
		['no secret', () => (env.TURNSTILE_SECRET_KEY = undefined)],
		[
			'a Cloudflare test secret',
			() => (env.TURNSTILE_SECRET_KEY = '1x0000000000000000000000000000000AA')
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
	})
})
