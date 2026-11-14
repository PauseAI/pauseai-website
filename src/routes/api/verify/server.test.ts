import {
	verificationConfirmedParameter,
	verificationNeedsClick,
	verificationParameter
} from '$lib/config.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Row = { id: string; fields: Record<string, unknown>; _rawJson?: { createdTime: string } }

const env: Record<string, string | undefined> = {}
let selected: Row[] = []
let lastFormula = ''
const find = vi.fn<(id: string) => Promise<Row>>()
const update = vi.fn<(id: string, fields: Record<string, unknown>) => Promise<void>>()
const tableIds: string[] = []
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()

vi.mock('$env/static/private', () => ({ AIRTABLE_WRITE_API_KEY: 'test-key' }))
vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError }))
const verifyStatementInCrm =
	vi.fn<(key: string, token: string) => Promise<'ok' | 'expired' | 'invalid' | 'failed'>>()
vi.mock('$lib/server/statementCrm', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/server/statementCrm')>()),
	verifyStatementInCrm
}))
const verifySignupInCrm =
	vi.fn<(key: string, token: string) => Promise<'ok' | 'expired' | 'invalid' | 'failed'>>()
vi.mock('$lib/server/memberCrm', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/server/memberCrm')>()),
	verifySignupInCrm
}))
vi.mock('airtable', () => ({
	default: class {
		base() {
			return {
				table: (tableId: string) => {
					tableIds.push(tableId)
					return {
						select: ({ filterByFormula }: { filterByFormula: string }) => {
							lastFormula = filterByFormula
							return { firstPage: () => Promise.resolve(selected) }
						},
						find,
						update
					}
				}
			}
		}
	}
}))

const { POST } = await import('./+server.js')
const { mintVerificationToken } = await import('$lib/server/emailVerification')

const SECRET = 'test-secret'
const DAY_MS = 24 * 60 * 60 * 1000
const NOW = 1_800_000_000_000
const OLD = new Date(NOW - 100 * DAY_MS).toISOString()
const RECENT = new Date(NOW - 10 * DAY_MS).toISOString()

const verify = (query: string) =>
	POST({
		request: new Request('https://pauseai.info/api/verify', { method: 'POST', body: query })
	} as Parameters<typeof POST>[0])

const link = (extraQuery = '') => verify(`${verificationParameter}=abc123${extraQuery}`)
const tokenFor = (recordId: string, email: string, mintedAt = NOW) =>
	mintVerificationToken(SECRET, recordId, email, mintedAt)
const signedLink = async (recordId: string) =>
	link(`&token=${await tokenFor(recordId, 'ada@example.org')}`)

// Changes the signature's first character, which unlike its last carries no padding bits.
function tampered(token: string): string {
	const [version, expiry, signature] = token.split('.')
	const first = signature.startsWith('A') ? 'B' : 'A'
	return `${version}.${expiry}.${first}${signature.slice(1)}`
}

const member = (id: string, fields: Record<string, unknown> = {}): Row => ({
	id,
	fields: { Email: 'ada@example.org', ...fields }
})

// A row the retired Airtable sender mailed an unsigned link for.
const mailed = (id: string, createdTime: string): Row => ({
	...member(id, { 'Sent emails': true }),
	_rawJson: { createdTime }
})

const merged = (fields: Record<string, unknown> = {}): Row =>
	member('recMerged', { 'Merged into': ['recSurvivor'], ...fields })

const survivor = (fields: Record<string, unknown> = {}): Row => ({
	id: 'recSurvivor',
	fields: { Email: 'ada@example.org', ...fields }
})

beforeEach(() => {
	for (const key of Object.keys(env)) delete env[key]
	env.EMAIL_VERIFICATION_SECRET = SECRET
	vi.useFakeTimers({ toFake: ['Date'] })
	vi.setSystemTime(NOW)
	selected = []
	tableIds.length = 0
	// A re-read returns the row as the select found it unless a test says otherwise.
	find.mockReset().mockImplementation((id) => {
		const row = selected.find((candidate) => candidate.id === id)
		return row ? Promise.resolve(row) : Promise.reject(new Error('NOT_FOUND'))
	})
	update.mockReset().mockResolvedValue()
	reportError.mockReset().mockResolvedValue()
	verifyStatementInCrm.mockReset().mockResolvedValue('ok')
	verifySignupInCrm.mockReset().mockResolvedValue('ok')
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
	vi.useRealTimers()
})

describe('POST /api/verify: signed links', () => {
	it('ticks the row a valid token names', async () => {
		selected = [member('recPlain')]
		const token = await tokenFor('recPlain', 'ada@example.org', NOW - 80 * DAY_MS)
		const response = await link(`&token=${token}`)
		expect(response.status).toBe(200)
		expect(lastFormula).toBe('{Airtable ID} = "abc123"')
		expect(update).toHaveBeenCalledExactlyOnceWith('recPlain', { 'Verified email': true })
	})

	it('refuses a token minted for an address the row no longer has', async () => {
		selected = [member('recPlain', { Email: 'grace@example.org' })]
		const token = await tokenFor('recPlain', 'ada@example.org')
		const response = await link(`&token=${token}`)
		expect(response.status).toBe(410)
		expect(await response.json()).toEqual({ outcome: 'expired' })
		expect(update).not.toHaveBeenCalled()
	})

	it('undoes the tick when the address changes between the read and the write', async () => {
		selected = [member('recPlain')]
		find.mockResolvedValue(member('recPlain', { Email: 'grace@example.org' }))
		const token = await tokenFor('recPlain', 'ada@example.org')
		const response = await link(`&token=${token}`)
		expect(response.status).toBe(410)
		expect(await response.json()).toEqual({ outcome: 'expired' })
		expect(find).toHaveBeenCalledExactlyOnceWith('recPlain')
		expect(update.mock.calls).toEqual([
			['recPlain', { 'Verified email': true }],
			['recPlain', { 'Verified email': false }]
		])
	})

	it('keeps the tick when the re-read address differs only in case and spacing', async () => {
		selected = [member('recPlain')]
		find.mockResolvedValue(member('recPlain', { Email: ' Ada@Example.org ' }))
		const token = await tokenFor('recPlain', 'ada@example.org')
		expect((await link(`&token=${token}`)).status).toBe(200)
		expect(update).toHaveBeenCalledExactlyOnceWith('recPlain', { 'Verified email': true })
	})

	it('undoes the tick on a survivor whose address changes after it was chosen', async () => {
		selected = [merged()]
		find
			.mockResolvedValueOnce(survivor({ 'Verified email': true }))
			.mockResolvedValueOnce(survivor({ Email: 'grace@example.org' }))
		const token = await tokenFor('recMerged', 'ada@example.org')
		expect((await link(`&token=${token}`)).status).toBe(410)
		expect(update.mock.calls).toEqual([
			['recSurvivor', { 'Verified email': true }],
			['recSurvivor', { 'Verified email': false }]
		])
	})

	it('refuses a tampered token', async () => {
		selected = [member('recPlain')]
		const token = tampered(await tokenFor('recPlain', 'ada@example.org'))
		expect((await link(`&token=${token}`)).status).toBe(410)
		expect(update).not.toHaveBeenCalled()
	})

	it('refuses every link while the secret is unset, reading nothing', async () => {
		const token = await tokenFor('recPlain', 'ada@example.org')
		delete env.EMAIL_VERIFICATION_SECRET
		selected = [mailed('recPlain', RECENT)]
		expect((await link('&token=garbage')).status).toBe(410)
		expect((await link(`&token=${token}`)).status).toBe(410)
		expect(tableIds).toEqual([])
		expect(update).not.toHaveBeenCalled()
	})
})

describe('POST /api/verify: links without a token', () => {
	it('refuses one for a mailed row under 30 days old, reading nothing', async () => {
		selected = [mailed('recPlain', RECENT)]
		const response = await link()
		expect(response.status).toBe(410)
		expect(await response.json()).toEqual({ outcome: 'expired' })
		expect(tableIds).toEqual([])
		expect(update).not.toHaveBeenCalled()
	})

	it('refuses one for a mailed row clicked within 30 days of the 2026-10-07 cutover', async () => {
		vi.setSystemTime(Date.parse('2026-10-27T00:00:00Z'))
		selected = [mailed('recPlain', '2026-10-01T00:00:00.000Z')]
		expect((await link()).status).toBe(410)
		expect(update).not.toHaveBeenCalled()
	})

	it('refuses one for a row that does not exist', async () => {
		expect((await link()).status).toBe(410)
	})
})

describe('POST /api/verify: merged rows', () => {
	it('ticks the survivor of a merged row when the survivor qualifies', async () => {
		selected = [merged()]
		find.mockResolvedValue(survivor({ 'Verified email': true }))
		const token = await tokenFor('recMerged', 'ada@example.org')
		const response = await link(`&token=${token}`)
		expect(response.status).toBe(200)
		expect(find.mock.calls).toEqual([['recSurvivor'], ['recSurvivor']])
		expect(update).toHaveBeenCalledExactlyOnceWith('recSurvivor', { 'Verified email': true })
		expect(reportError).not.toHaveBeenCalled()
	})

	it('checks the token against the named row, not the survivor', async () => {
		selected = [merged()]
		find.mockResolvedValue(survivor({ 'Verified email': true }))
		const token = await tokenFor('recSurvivor', 'ada@example.org')
		expect((await link(`&token=${token}`)).status).toBe(410)
		expect(find).not.toHaveBeenCalled()
	})

	it('ticks the named row when the survivor does not qualify', async () => {
		selected = [merged()]
		find.mockResolvedValue(survivor({ 'Discord Username': 'ada' }))
		const response = await signedLink('recMerged')
		expect(response.status).toBe(200)
		expect(update).toHaveBeenCalledExactlyOnceWith('recMerged', { 'Verified email': true })
		expect(reportError).not.toHaveBeenCalled()
	})

	it('reports two targets and ticks the named row', async () => {
		selected = [merged({ 'Merged into': ['recSurvivor', 'recOther'] })]
		const response = await signedLink('recMerged')
		expect(response.status).toBe(200)
		// Only the re-read after the tick.
		expect(find.mock.calls).toEqual([['recMerged']])
		expect(update).toHaveBeenCalledExactlyOnceWith('recMerged', { 'Verified email': true })
		expect(reportError).toHaveBeenCalledExactlyOnceWith(
			expect.any(Error),
			expect.objectContaining({ recordId: 'recMerged' })
		)
	})

	it('reports a target that is itself merged and ticks the named row', async () => {
		selected = [merged()]
		find.mockResolvedValue(survivor({ 'Verified email': true, 'Merged into': ['recFinal'] }))
		const response = await signedLink('recMerged')
		expect(response.status).toBe(200)
		expect(update).toHaveBeenCalledExactlyOnceWith('recMerged', { 'Verified email': true })
		expect(reportError).toHaveBeenCalledExactlyOnceWith(
			expect.any(Error),
			expect.objectContaining({ recordId: 'recMerged' })
		)
	})

	it('still verifies the named row when the survivor cannot be read', async () => {
		selected = [merged()]
		const failure = new Error('NOT_FOUND')
		find.mockRejectedValueOnce(failure)
		const response = await signedLink('recMerged')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe('OK')
		expect(update).toHaveBeenCalledExactlyOnceWith('recMerged', { 'Verified email': true })
		expect(reportError).toHaveBeenCalledExactlyOnceWith(
			failure,
			expect.objectContaining({ operation: 'followMergedInto', recordId: 'recMerged' })
		)
	})
})

describe('POST /api/verify: statement table', () => {
	const CONFIRMED = `&table=statement&${verificationConfirmedParameter}=true`

	it('verifies a confirmed link by id alone and never follows a link', async () => {
		selected = [{ id: 'recStatement', fields: { 'Merged into': ['recSurvivor'] } }]
		find.mockResolvedValue(survivor({ 'Verified email': true }))
		const response = await link(CONFIRMED)
		expect(response.status).toBe(200)
		expect(tableIds).toEqual(['tbl2emfOWNWoVz1kW'])
		expect(lastFormula).toBe('{airtable_id} = "abc123"')
		expect(find).not.toHaveBeenCalled()
		expect(update).toHaveBeenCalledExactlyOnceWith('recStatement', { email_verified: true })
	})

	it.each([
		['no click', '&table=statement'],
		['anything but a click', `&table=statement&${verificationConfirmedParameter}=1`]
	])('publishes nothing on %s, without touching the table', async (_label, query) => {
		selected = [{ id: 'recStatement', fields: {} }]
		const response = await link(query)

		expect(response.status).toBe(400)
		expect(tableIds).toEqual([])
		expect(update).not.toHaveBeenCalled()
	})

	it('still accepts a link already sent, with no token or expiry, however old', async () => {
		selected = [{ id: 'recStatement', fields: {}, _rawJson: { createdTime: OLD } }]
		const response = await link(CONFIRMED)

		expect(response.status).toBe(200)
		expect(update).toHaveBeenCalledExactlyOnceWith('recStatement', { email_verified: true })
	})
})

describe('verificationNeedsClick', () => {
	it.each([
		['table=statement&verificationKey=abc', true],
		['verificationKey=abc&table=statement', true],
		['table=join&verificationKey=abc', false],
		['table=join&verificationKey=abc&token=x', false],
		['verificationKey=abc', false],
		['', false]
	])('for %j is %s', (query, expected) => {
		expect(verificationNeedsClick(query)).toBe(expected)
	})
})

describe('POST /api/verify: member links need no click', () => {
	it('verifies a member link with no confirmation', async () => {
		selected = [member('recMember')]
		const response = await signedLink('recMember')

		expect(response.status).toBe(200)
		expect(update).toHaveBeenCalledExactlyOnceWith('recMember', { 'Verified email': true })
	})
})

describe('POST /api/verify: input', () => {
	it('refuses a missing or non-alphanumeric key and an unknown table', async () => {
		expect((await verify('')).status).toBe(400)
		expect((await verify(`${verificationParameter}=abc"`)).status).toBe(400)
		expect((await link('&table=nope')).status).toBe(400)
	})
})

describe('POST /api/verify: statement links in CiviCRM', () => {
	const CONFIRMED = `&table=statement&${verificationConfirmedParameter}=true`
	const TOKEN = 'v1.1800000000.' + 'A'.repeat(43)
	const crmLink = (extraQuery = '') =>
		verify(`${verificationParameter}=s12345&token=${TOKEN}${CONFIRMED}${extraQuery}`)

	it.each([undefined, 'airtable', 'civicrm'])(
		'sends an s<id> key with a token to CiviCRM with STATEMENT_BACKEND=%s',
		async (backend) => {
			env.STATEMENT_BACKEND = backend
			const response = await crmLink()

			expect(response.status).toBe(200)
			expect(verifyStatementInCrm).toHaveBeenCalledExactlyOnceWith('s12345', TOKEN)
			expect(tableIds).toEqual([])
			expect(update).not.toHaveBeenCalled()
		}
	)

	it.each([
		['an old Airtable key', 'abc123', 200],
		['an s<id> key without a token', 's12345', 404]
	])('sends %s to Airtable with the Airtable backend', async (_label, key, status) => {
		selected = key === 'abc123' ? [{ id: 'recStatement', fields: {} }] : []
		const response = await verify(`${verificationParameter}=${key}${CONFIRMED}`)

		expect(response.status).toBe(status)
		expect(verifyStatementInCrm).not.toHaveBeenCalled()
		expect(tableIds).toEqual(['tbl2emfOWNWoVz1kW'])
		if (status === 200) {
			expect(update).toHaveBeenCalledExactlyOnceWith('recStatement', { email_verified: true })
		}
	})

	it('sends an old Airtable key to CiviCRM with the CiviCRM backend, token empty', async () => {
		env.STATEMENT_BACKEND = 'civicrm'
		const response = await link(CONFIRMED)

		expect(response.status).toBe(200)
		expect(verifyStatementInCrm).toHaveBeenCalledExactlyOnceWith('abc123', '')
		expect(tableIds).toEqual([])
	})

	it.each([
		['expired', 410],
		['invalid', 404],
		['failed', 502]
	] as const)('answers %s with %i', async (outcome, status) => {
		verifyStatementInCrm.mockResolvedValue(outcome)
		const response = await crmLink()

		expect(response.status).toBe(status)
		if (outcome === 'expired') expect(await response.json()).toEqual({ outcome: 'expired' })
	})

	it('still needs the click before calling CiviCRM', async () => {
		env.STATEMENT_BACKEND = 'civicrm'
		const response = await verify(`${verificationParameter}=s12345&token=${TOKEN}&table=statement`)

		expect(response.status).toBe(400)
		expect(verifyStatementInCrm).not.toHaveBeenCalled()
	})

	it('leaves member links in Airtable with the CiviCRM backend', async () => {
		env.STATEMENT_BACKEND = 'civicrm'
		selected = [member('recMember')]
		const response = await signedLink('recMember')

		expect(response.status).toBe(200)
		expect(verifyStatementInCrm).not.toHaveBeenCalled()
		expect(update).toHaveBeenCalledExactlyOnceWith('recMember', { 'Verified email': true })
	})
})

describe('POST /api/verify: signup keys in CiviCRM', () => {
	const KEY = 'memAbCdEfGhIjKlMnOpQrStUv'
	const TOKEN = 'v1.1800000000.' + 'A'.repeat(43)
	const signupLink = (query = `&token=${TOKEN}`) =>
		verify(
			`${verificationParameter}=${KEY}${query}&table=join&${verificationConfirmedParameter}=true`
		)

	it.each([undefined, 'airtable', 'civicrm'])(
		'sends a signup key to CiviCRM with SIGNUP_BACKEND=%s, reading no Airtable row',
		async (backend) => {
			env.SIGNUP_BACKEND = backend
			const response = await signupLink()

			expect(response.status).toBe(200)
			expect(verifySignupInCrm).toHaveBeenCalledExactlyOnceWith(KEY, TOKEN)
			expect(tableIds).toEqual([])
			expect(update).not.toHaveBeenCalled()
		}
	)

	it.each([
		['expired', 410],
		['invalid', 404],
		['failed', 502]
	] as const)('answers %s with %i', async (outcome, status) => {
		verifySignupInCrm.mockResolvedValue(outcome)
		expect((await signupLink()).status).toBe(status)
	})

	it('refuses a signup key without a token as expired, calling nothing', async () => {
		const response = await signupLink('')
		expect(response.status).toBe(410)
		expect(verifySignupInCrm).not.toHaveBeenCalled()
	})

	it('keeps a record id link on Airtable', async () => {
		selected = [member('recMember')]
		await signedLink('recMember')
		expect(verifySignupInCrm).not.toHaveBeenCalled()
	})
})
