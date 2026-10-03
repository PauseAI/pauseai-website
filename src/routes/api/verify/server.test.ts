import { verificationParameter } from '$lib/config.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type Row = { id: string; fields: Record<string, unknown> }

let selected: Row[] = []
let lastFormula = ''
const find = vi.fn<(id: string) => Promise<Row>>()
const update = vi.fn<(id: string, fields: Record<string, unknown>) => Promise<void>>()
const tableIds: string[] = []
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()

vi.mock('$env/static/private', () => ({ AIRTABLE_WRITE_API_KEY: 'test-key' }))
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

const { GET } = await import('./+server.js')

const verify = (extraQuery = '') =>
	GET({
		url: new URL(`https://pauseai.info/api/verify?${verificationParameter}=abc123${extraQuery}`)
	} as Parameters<typeof GET>[0])

const merged = (fields: Record<string, unknown> = {}): Row => ({
	id: 'recMerged',
	fields: { Email: 'ada@example.org', 'Merged into': ['recSurvivor'], ...fields }
})

const survivor = (fields: Record<string, unknown> = {}): Row => ({
	id: 'recSurvivor',
	fields: { Email: 'ada@example.org', ...fields }
})

beforeEach(() => {
	selected = []
	tableIds.length = 0
	find.mockReset()
	update.mockReset().mockResolvedValue()
	reportError.mockReset().mockResolvedValue()
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('GET /api/verify', () => {
	it('ticks an unmerged member row without a second read', async () => {
		selected = [{ id: 'recPlain', fields: { Email: 'ada@example.org' } }]
		const response = await verify()
		expect(response.status).toBe(200)
		expect(lastFormula).toBe('{Airtable ID} = "abc123"')
		expect(find).not.toHaveBeenCalled()
		expect(update).toHaveBeenCalledExactlyOnceWith('recPlain', { 'Verified email': true })
		expect(reportError).not.toHaveBeenCalled()
	})

	it('ticks the survivor of a merged row when the survivor qualifies', async () => {
		selected = [merged()]
		find.mockResolvedValue(survivor({ 'Verified email': true }))
		const response = await verify()
		expect(response.status).toBe(200)
		expect(find).toHaveBeenCalledExactlyOnceWith('recSurvivor')
		expect(update).toHaveBeenCalledExactlyOnceWith('recSurvivor', { 'Verified email': true })
		expect(reportError).not.toHaveBeenCalled()
	})

	it('ticks the named row when the survivor does not qualify', async () => {
		selected = [merged()]
		find.mockResolvedValue(survivor({ 'Discord Username': 'ada' }))
		const response = await verify()
		expect(response.status).toBe(200)
		expect(update).toHaveBeenCalledExactlyOnceWith('recMerged', { 'Verified email': true })
		expect(reportError).not.toHaveBeenCalled()
	})

	it('reports two targets and ticks the named row', async () => {
		selected = [merged({ 'Merged into': ['recSurvivor', 'recOther'] })]
		const response = await verify()
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
		const response = await verify()
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
		const response = await verify()
		expect(response.status).toBe(200)
		expect(await response.text()).toBe('OK')
		expect(update).toHaveBeenCalledExactlyOnceWith('recMerged', { 'Verified email': true })
		expect(reportError).toHaveBeenCalledExactlyOnceWith(
			failure,
			expect.objectContaining({ operation: 'followMergedInto', recordId: 'recMerged' })
		)
	})

	it('never follows a link on the statement table', async () => {
		selected = [{ id: 'recStatement', fields: { 'Merged into': ['recSurvivor'] } }]
		find.mockResolvedValue(survivor({ 'Verified email': true }))
		const response = await verify('&table=statement')
		expect(response.status).toBe(200)
		expect(tableIds).toEqual(['tbl2emfOWNWoVz1kW'])
		expect(lastFormula).toBe('{airtable_id} = "abc123"')
		expect(find).not.toHaveBeenCalled()
		expect(update).toHaveBeenCalledExactlyOnceWith('recStatement', { email_verified: true })
	})
})
