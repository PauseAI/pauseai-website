import { beforeEach, describe, expect, it, vi } from 'vitest'
import vectors from './emailVerification.vectors.json'

const env: Record<string, string | undefined> = {}
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()
const getRecord =
	vi.fn<(...args: unknown[]) => Promise<Record<string, unknown> | 'missing' | 'failed'>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError }))
vi.mock('$lib/airtable', () => ({ getRecord }))

const {
	LEGACY_LINK_CUTOVER,
	LINK_TTL_SECONDS,
	acceptsUnsignedLink,
	emailHash,
	mintVerificationToken,
	normaliseEmail,
	signedVerificationLink,
	verificationPayloadPrefix,
	verifyVerificationToken
} = await import('./emailVerification.js')

const SECRET = 'test-secret'
const NOW = 1_800_000_000_000
const TTL_MS = LINK_TTL_SECONDS * 1000
const DAY_MS = 24 * 60 * 60 * 1000

beforeEach(() => {
	for (const key of Object.keys(env)) delete env[key]
	reportError.mockReset().mockResolvedValue()
	getRecord.mockReset()
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

describe('signedVerificationLink', () => {
	it('signs over the row it reads, keyed by the id without its rec prefix', async () => {
		env.EMAIL_VERIFICATION_SECRET = SECRET
		getRecord.mockResolvedValue({ Email: 'Ada@Example.org' })
		const link = new URL(await signedVerificationLink('recAda', NOW))
		expect(getRecord).toHaveBeenCalledWith('appWPTGqZmUcs3NWu', 'tblL1icZBhTV1gQ9o', 'recAda')
		expect(link.pathname).toBe('/verify')
		expect(link.searchParams.get('table')).toBe('join')
		expect(link.searchParams.get('verificationKey')).toBe('Ada')
		const token = link.searchParams.get('token') ?? ''
		expect(await verifyVerificationToken(SECRET, 'recAda', 'ada@example.org', token, NOW)).toBe(
			'valid'
		)
	})

	it('falls back to the unsigned link without a secret, reading nothing', async () => {
		const link = new URL(await signedVerificationLink('recAda', NOW))
		expect(link.searchParams.has('token')).toBe(false)
		expect(link.searchParams.get('verificationKey')).toBe('Ada')
		expect(getRecord).not.toHaveBeenCalled()
	})

	it('reports a secret missing in production once', async () => {
		vi.resetModules()
		const fresh = await import('./emailVerification.js')
		env.ONBOARDING_LIVE = 'true'
		await fresh.signedVerificationLink('recAda', NOW)
		await fresh.signedVerificationLink('recAda', NOW)
		expect(reportError).toHaveBeenCalledOnce()
	})

	it('falls back to the unsigned link, reporting without it, when the row has no address', async () => {
		env.EMAIL_VERIFICATION_SECRET = SECRET
		for (const row of ['failed', 'missing', { Email: '  ' }] as const) {
			getRecord.mockResolvedValueOnce(row)
			const link = new URL(await signedVerificationLink('recAda', NOW))
			expect(link.searchParams.has('token')).toBe(false)
		}
		// getRecord reports its own failed read.
		expect(reportError).toHaveBeenCalledTimes(2)
		for (const [, context] of reportError.mock.calls) {
			expect(context).toEqual({ recordId: 'recAda' })
		}
	})
})

describe('acceptsUnsignedLink', () => {
	const row = (createdTime: string, sent = true) => ({
		createdTime,
		fields: sent ? { 'Sent emails': true } : {}
	})
	const afterCutoverWindow = LEGACY_LINK_CUTOVER + 91 * DAY_MS

	it('accepts any mailed row within 90 days of the cutover', () => {
		const clicked = LEGACY_LINK_CUTOVER + 89 * DAY_MS
		expect(acceptsUnsignedLink(row('2024-01-01T00:00:00.000Z'), clicked)).toBe(true)
	})

	it('after that, accepts a mailed row only while it is under 90 days old', () => {
		const recent = new Date(afterCutoverWindow - 89 * DAY_MS).toISOString()
		const old = new Date(afterCutoverWindow - 91 * DAY_MS).toISOString()
		expect(acceptsUnsignedLink(row(recent), afterCutoverWindow)).toBe(true)
		expect(acceptsUnsignedLink(row(old), afterCutoverWindow)).toBe(false)
		expect(acceptsUnsignedLink({ fields: { 'Sent emails': true } }, afterCutoverWindow)).toBe(false)
	})

	it('never accepts a row the Airtable sender has not mailed', () => {
		expect(
			acceptsUnsignedLink(
				row(new Date(LEGACY_LINK_CUTOVER).toISOString(), false),
				LEGACY_LINK_CUTOVER
			)
		).toBe(false)
	})
})
