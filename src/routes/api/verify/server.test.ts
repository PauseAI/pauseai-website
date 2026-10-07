import { verificationParameter } from '$lib/config.js'
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
const { LEGACY_LINK_CUTOVER, mintVerificationToken } = await import('$lib/server/emailVerification')

const SECRET = 'test-secret'
const DAY_MS = 24 * 60 * 60 * 1000
// Past the cutover's grace, so only a row's own age can admit an unsigned link.
const NOW = LEGACY_LINK_CUTOVER + 120 * DAY_MS
const RECENT = new Date(NOW - 10 * DAY_MS).toISOString()
const OLD = new Date(NOW - 100 * DAY_MS).toISOString()

const verify = (query: string) =>
	POST({
		request: new Request('https://pauseai.info/api/verify', { method: 'POST', body: query })
	} as Parameters<typeof POST>[0])

const link = (extraQuery = '') => verify(`${verificationParameter}=abc123${extraQuery}`)
const tokenFor = (recordId: string, email: string, mintedAt = NOW) =>
	mintVerificationToken(SECRET, recordId, email, mintedAt)

// Changes the signature's first character, which unlike its last carries no padding bits.
function tampered(token: string): string {
	const [version, expiry, signature] = token.split('.')
	const first = signature.startsWith('A') ? 'B' : 'A'
	return `${version}.${expiry}.${first}${signature.slice(1)}`
}

// A Members row the Airtable sender has mailed.
const member = (id: string, fields: Record<string, unknown> = {}, createdTime = RECENT): Row => ({
	id,
	fields: { Email: 'ada@example.org', 'Sent emails': true, ...fields },
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
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
	vi.useRealTimers()
})

describe('POST /api/verify: signed links', () => {
	it('ticks the row a valid token names', async () => {
		selected = [member('recPlain', {}, OLD)]
		const token = await tokenFor('recPlain', 'ada@example.org', NOW - 80 * DAY_MS)
		const response = await link(`&token=${token}`)
		expect(response.status).toBe(200)
		expect(lastFormula).toBe('{Airtable ID} = "abc123"')
		expect(update).toHaveBeenCalledExactlyOnceWith('recPlain', { 'Verified email': true })
	})

	it('needs no Sent emails tick, since the token proves the mail', async () => {
		selected = [member('recPlain', { 'Sent emails': false })]
		const token = await tokenFor('recPlain', 'ada@example.org')
		expect((await link(`&token=${token}`)).status).toBe(200)
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

	it('refuses a bad token even on a row an unsigned link would verify', async () => {
		selected = [member('recPlain')]
		const token = tampered(await tokenFor('recPlain', 'ada@example.org'))
		expect((await link(`&token=${token}`)).status).toBe(410)
		expect(update).not.toHaveBeenCalled()
	})

	it('judges a token as an unsigned link while the secret is unset', async () => {
		delete env.EMAIL_VERIFICATION_SECRET
		selected = [member('recPlain')]
		expect((await link('&token=garbage')).status).toBe(200)
		selected = [member('recOld', {}, OLD)]
		const token = await tokenFor('recOld', 'ada@example.org')
		expect((await link(`&token=${token}`)).status).toBe(410)
		expect(update).toHaveBeenCalledOnce()
	})
})

describe('POST /api/verify: unsigned links', () => {
	it('accepts one for a mailed row under 30 days old', async () => {
		selected = [member('recPlain')]
		expect((await link()).status).toBe(200)
		expect(update).toHaveBeenCalledExactlyOnceWith('recPlain', { 'Verified email': true })
		// Nothing binds an unsigned link to an address, so there is nothing to re-check.
		expect(find).not.toHaveBeenCalled()
	})

	it('accepts one for an old mailed row within 30 days of the cutover', async () => {
		vi.setSystemTime(LEGACY_LINK_CUTOVER + 20 * DAY_MS)
		selected = [member('recPlain', {}, '2025-01-01T00:00:00.000Z')]
		expect((await link()).status).toBe(200)
	})

	it('refuses one for an old row after that, and for a row never mailed', async () => {
		selected = [member('recOld', {}, OLD)]
		const old = await link()
		expect(old.status).toBe(410)
		expect(await old.json()).toEqual({ outcome: 'expired' })
		selected = [member('recUnsent', { 'Sent emails': false })]
		expect((await link()).status).toBe(410)
		expect(update).not.toHaveBeenCalled()
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
		const response = await link()
		expect(response.status).toBe(200)
		expect(update).toHaveBeenCalledExactlyOnceWith('recMerged', { 'Verified email': true })
		expect(reportError).not.toHaveBeenCalled()
	})

	it('reports two targets and ticks the named row', async () => {
		selected = [merged({ 'Merged into': ['recSurvivor', 'recOther'] })]
		const response = await link()
		expect(response.status).toBe(200)
		expect(find).not.toHaveBeenCalled()
		expect(update).toHaveBeenCalledExactlyOnceWith('recMerged', { 'Verified email': true })
		expect(reportError).toHaveBeenCalledExactlyOnceWith(
			expect.any(Error),
			expect.objectContaining({ recordId: 'recMerged' })
		)
	})

	it('reports a target that is itself merged and ticks the named row', async () => {
		selected = [merged()]
		find.mockResolvedValue(survivor({ 'Verified email': true, 'Merged into': ['recFinal'] }))
		const response = await link()
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
		find.mockRejectedValue(failure)
		const response = await link()
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
	it('verifies by id alone and never follows a link', async () => {
		selected = [{ id: 'recStatement', fields: { 'Merged into': ['recSurvivor'] } }]
		find.mockResolvedValue(survivor({ 'Verified email': true }))
		const response = await link('&table=statement')
		expect(response.status).toBe(200)
		expect(tableIds).toEqual(['tbl2emfOWNWoVz1kW'])
		expect(lastFormula).toBe('{airtable_id} = "abc123"')
		expect(find).not.toHaveBeenCalled()
		expect(update).toHaveBeenCalledExactlyOnceWith('recStatement', { email_verified: true })
	})
})

describe('POST /api/verify: input', () => {
	it('refuses a missing or non-alphanumeric key and an unknown table', async () => {
		expect((await verify('')).status).toBe(400)
		expect((await verify(`${verificationParameter}=abc"`)).status).toBe(400)
		expect((await link('&table=nope')).status).toBe(400)
	})
})
