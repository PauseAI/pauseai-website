import { beforeEach, describe, expect, it, vi } from 'vitest'
import vectors from './emailVerification.vectors.json'

const env: Record<string, string | undefined> = {}
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError }))

const {
	LINK_TTL_SECONDS,
	emailHash,
	getVerificationSecret,
	mintVerificationToken,
	normaliseEmail,
	verificationLink,
	verificationPayloadPrefix,
	verifyVerificationToken
} = await import('./emailVerification.js')

const SECRET = 'test-secret'
const NOW = 1_800_000_000_000
const TTL_MS = LINK_TTL_SECONDS * 1000

beforeEach(() => {
	for (const key of Object.keys(env)) delete env[key]
	reportError.mockReset().mockResolvedValue()
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('shared test vectors', () => {
	it('has a 90-day lifetime', () => {
		expect(vectors.ttlSeconds).toBe(LINK_TTL_SECONDS)
		expect(LINK_TTL_SECONDS).toBe(90 * 24 * 60 * 60)
	})

	for (const vector of vectors.cases) {
		it(`reproduces ${JSON.stringify(vector.email)}`, async () => {
			expect(normaliseEmail(vector.email)).toBe(vector.normalisedEmail)
			expect(await emailHash(vector.email)).toBe(vector.emailHash)
			const prefix = await verificationPayloadPrefix(vector.recordId, vector.email)
			expect(`${prefix}:${vectors.expiry}`).toBe(vector.payload)
			expect(
				await mintVerificationToken(vectors.secret, vector.recordId, vector.email, vectors.nowMs)
			).toBe(vector.token)
			expect(
				await verifyVerificationToken(
					vectors.secret,
					vector.recordId,
					vector.email,
					vector.token,
					vectors.nowMs
				)
			).toBe('valid')
		})
	}
})

// Parsing, tampering and expiry are signedToken.test.ts's; these pin what the token binds.
describe('verifyVerificationToken', () => {
	it('lasts 90 days and binds the record and the normalised address', async () => {
		const token = await mintVerificationToken(SECRET, 'rec1', 'ada@example.org', NOW)
		const check = (recordId: string, email: string, now = NOW) =>
			verifyVerificationToken(SECRET, recordId, email, token, now)
		expect(await check('rec1', ' ADA@example.org ', NOW + TTL_MS - 1000)).toBe('valid')
		expect(await check('rec1', 'ada@example.org', NOW + TTL_MS)).toBe('expired')
		expect(await check('rec2', 'ada@example.org')).toBe('invalid')
		expect(await check('rec1', 'grace@example.org')).toBe('invalid')
	})

	it('does not accept a continuation token for the same record', async () => {
		const { mintToken } = await import('./onboardingContinuation.js')
		const continuation = await mintToken(SECRET, 'rec1', NOW)
		expect(
			await verifyVerificationToken(SECRET, 'rec1', 'ada@example.org', continuation, NOW)
		).toBe('invalid')
	})
})

describe('verificationLink', () => {
	it('builds the /verify link from the key and the token', () => {
		const link = new URL(verificationLink('Ada', 'v1.1.sig'))
		expect(link.pathname).toBe('/verify')
		expect(link.searchParams.get('table')).toBe('join')
		expect(link.searchParams.get('verificationKey')).toBe('Ada')
		expect(link.searchParams.get('token')).toBe('v1.1.sig')
	})
})

describe('getVerificationSecret', () => {
	it('returns the secret when set', () => {
		env.EMAIL_VERIFICATION_SECRET = SECRET
		expect(getVerificationSecret()).toBe(SECRET)
		expect(reportError).not.toHaveBeenCalled()
	})

	it('reports a secret missing in production once', async () => {
		vi.resetModules()
		const fresh = await import('./emailVerification.js')
		env.ONBOARDING_LIVE = 'true'
		expect(fresh.getVerificationSecret()).toBeUndefined()
		expect(fresh.getVerificationSecret()).toBeUndefined()
		expect(reportError).toHaveBeenCalledOnce()
	})
})
