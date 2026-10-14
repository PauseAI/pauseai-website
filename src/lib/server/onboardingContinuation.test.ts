import { SIGNUP_MAX_AGE_MS } from '$lib/components/onboarding/signupMaxAge'
import { createHmac } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError }))

const { TOKEN_TTL_SECONDS, checkContinuation, issueContinuationToken, mintToken, verifyToken } =
	await import('./onboardingContinuation.js')

const SECRET = 'test-secret'
const NOW = 1_800_000_000_000
const TTL_MS = TOKEN_TTL_SECONDS * 1000

describe('verifyToken', () => {
	it('outlives the browser copy of the id', () => {
		expect(TOKEN_TTL_SECONDS * 1000).toBeGreaterThan(SIGNUP_MAX_AGE_MS)
	})

	it('accepts a token for the record it was minted for, until it expires', async () => {
		const token = await mintToken(SECRET, 'rec1', NOW)
		expect(await verifyToken(SECRET, 'rec1', token, NOW + TTL_MS - 1000)).toBe('valid')
		expect(await verifyToken(SECRET, 'rec1', token, NOW + TTL_MS)).toBe('expired')
	})

	it("rejects another record's token", async () => {
		const token = await mintToken(SECRET, 'rec1', NOW)
		expect(await verifyToken(SECRET, 'rec2', token, NOW)).toBe('invalid')
	})

	// Tokens in browsers and the CRM's copy of the check depend on these exact bytes.
	it('signs onboarding-continuation:v1:<recordId>:<expiry>', async () => {
		const expiry = NOW / 1000 + TOKEN_TTL_SECONDS
		const signature = createHmac('sha256', SECRET)
			.update(`onboarding-continuation:v1:rec1:${expiry}`)
			.digest('base64url')
		expect(await mintToken(SECRET, 'rec1', NOW)).toBe(`v1.${expiry}.${signature}`)
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
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		expect(await issueContinuationToken('rec1', NOW)).toBeUndefined()
		expect(await checkContinuation('rec1', '', NOW)).toBe('allowed')
		expect(await checkContinuation('rec1', 'garbage', NOW)).toBe('allowed')
		expect(reportError).not.toHaveBeenCalled()
	})

	it('lets a valid token through without reporting', async () => {
		env.ONBOARDING_CONTINUATION_SECRET = SECRET
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		const token = await issueContinuationToken('rec1', NOW)
		expect(token).toBeDefined()
		expect(await checkContinuation('rec1', token ?? '', NOW)).toBe('proven')
		expect(reportError).not.toHaveBeenCalled()
	})

	it('reports but allows a bad token while not enforcing', async () => {
		env.ONBOARDING_CONTINUATION_SECRET = SECRET
		env.ONBOARDING_CONTINUATION_ENFORCE = '1'
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
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		const token = await mintToken(SECRET, 'rec2', NOW)
		expect(await checkContinuation('rec1', token, NOW)).toBe('refused')
		const reported = JSON.stringify(reportError.mock.calls[0][1])
		expect(reported).toContain('"verdict":"invalid"')
		expect(reported).not.toContain(token)
		expect(reported).not.toContain(SECRET)
	})
})
