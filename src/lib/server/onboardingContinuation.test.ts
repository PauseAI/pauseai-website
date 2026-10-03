import { beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError }))

const { checkContinuation, issueContinuationToken, mintToken, verifyToken } =
	await import('./onboardingContinuation.js')

const SECRET = 'test-secret'
const NOW = 1_800_000_000_000
const DAY = 24 * 60 * 60 * 1000

describe('verifyToken', () => {
	it('accepts a token for the record it was minted for, until it expires', async () => {
		const token = await mintToken(SECRET, 'rec1', NOW)
		expect(token).toMatch(/^v1\.\d+\.[A-Za-z0-9_-]{43}$/)
		expect(await verifyToken(SECRET, 'rec1', token, NOW)).toBe('valid')
		expect(await verifyToken(SECRET, 'rec1', token, NOW + DAY - 1000)).toBe('valid')
	})

	it('rejects an expired token', async () => {
		const token = await mintToken(SECRET, 'rec1', NOW)
		expect(await verifyToken(SECRET, 'rec1', token, NOW + DAY)).toBe('expired')
	})

	it("rejects another record's token", async () => {
		const token = await mintToken(SECRET, 'rec1', NOW)
		expect(await verifyToken(SECRET, 'rec2', token, NOW)).toBe('invalid')
	})

	it('rejects a token signed with another secret', async () => {
		const token = await mintToken('other-secret', 'rec1', NOW)
		expect(await verifyToken(SECRET, 'rec1', token, NOW)).toBe('invalid')
	})

	it('rejects a tampered signature or expiry', async () => {
		const token = await mintToken(SECRET, 'rec1', NOW)
		const [version, expiry, signature] = token.split('.')
		const flipped = (signature[0] === 'A' ? 'B' : 'A') + signature.slice(1)
		expect(await verifyToken(SECRET, 'rec1', `${version}.${expiry}.${flipped}`, NOW)).toBe(
			'invalid'
		)
		const later = String(Number(expiry) + DAY / 1000)
		expect(await verifyToken(SECRET, 'rec1', `${version}.${later}.${signature}`, NOW)).toBe(
			'invalid'
		)
	})

	it('rejects an unknown version', async () => {
		const token = await mintToken(SECRET, 'rec1', NOW)
		expect(await verifyToken(SECRET, 'rec1', token.replace(/^v1/, 'v2'), NOW)).toBe('malformed')
	})

	it('rejects malformed tokens without throwing', async () => {
		const token = await mintToken(SECRET, 'rec1', NOW)
		const [, expiry, signature] = token.split('.')
		for (const bad of [
			'garbage',
			'v1.',
			`v1.${expiry}`,
			`v1.abc.${signature}`,
			`v1.${expiry}.${signature.slice(1)}`,
			`v1.${expiry}.${signature.slice(0, -1)}!`,
			`${token}.extra`
		]) {
			expect(await verifyToken(SECRET, 'rec1', bad, NOW)).toBe('malformed')
		}
	})

	it('reports a missing token', async () => {
		expect(await verifyToken(SECRET, 'rec1', '', NOW)).toBe('missing')
	})
})

describe('issueContinuationToken and checkContinuation', () => {
	beforeEach(() => {
		for (const key of Object.keys(env)) delete env[key]
		reportError.mockClear()
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	it('issues nothing and lets every update through without a secret, even when enforcing', async () => {
		env.ONBOARDING_CONTINUATION_ENFORCE = '1'
		expect(await issueContinuationToken('rec1', NOW)).toBeUndefined()
		expect(await checkContinuation('rec1', '', NOW)).toBe('allowed')
		expect(await checkContinuation('rec1', 'garbage', NOW)).toBe('allowed')
		expect(reportError).not.toHaveBeenCalled()
	})

	it('lets a valid token through without reporting', async () => {
		env.ONBOARDING_CONTINUATION_SECRET = SECRET
		env.ONBOARDING_CONTINUATION_ENFORCE = '1'
		const token = await issueContinuationToken('rec1', NOW)
		expect(token).toBeDefined()
		expect(await checkContinuation('rec1', token ?? '', NOW)).toBe('proven')
		expect(reportError).not.toHaveBeenCalled()
	})

	it('reports but allows a bad token while not enforcing', async () => {
		env.ONBOARDING_CONTINUATION_SECRET = SECRET
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		expect(await checkContinuation('rec1', '', NOW)).toBe('allowed')
		expect(reportError).toHaveBeenCalledOnce()
		const [error, context] = reportError.mock.calls[0]
		expect(String(error)).toContain('Onboarding continuation token missing')
		expect(context).toEqual({
			check: 'onboarding-continuation',
			verdict: 'missing',
			enforced: false,
			recordId: 'rec1'
		})
	})

	it('refuses a bad token when enforcing, without leaking it or the secret', async () => {
		env.ONBOARDING_CONTINUATION_SECRET = SECRET
		env.ONBOARDING_CONTINUATION_ENFORCE = '1'
		const token = await mintToken(SECRET, 'rec2', NOW)
		expect(await checkContinuation('rec1', token, NOW)).toBe('refused')
		const reported = JSON.stringify(reportError.mock.calls[0][1])
		expect(reported).toContain('"verdict":"invalid"')
		expect(reported).not.toContain(token)
		expect(reported).not.toContain(SECRET)
	})
})
