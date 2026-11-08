import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchAllPages = vi.fn<(...args: unknown[]) => Promise<unknown[]>>()

vi.mock('$env/dynamic/private', () => ({ env: {} }))
vi.mock('$lib/airtable.js', () => ({ fetchAllPages }))

const { GET } = await import('./+server.js')

const row = (fields: Record<string, unknown>) => ({
	id: 'rec',
	fields: {
		name: 'Ada Lovelace',
		email: 'ada@example.org',
		country: 'France',
		date: '2026-01-01',
		...fields
	}
})

async function list() {
	const response = await GET({ fetch, setHeaders: () => {} } as never)
	return (await response.json()) as {
		signatories: Record<string, unknown>[]
		totalCount: number
	}
}

beforeEach(() => {
	vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('GET /api/signatories', () => {
	it('reads the same table the signing path writes to', async () => {
		fetchAllPages.mockResolvedValue([])
		await list()

		expect(fetchAllPages.mock.calls.at(-1)?.[1]).toBe(
			'https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tbl2emfOWNWoVz1kW'
		)
	})

	it('lists only verified rows that are not duplicates', async () => {
		fetchAllPages.mockResolvedValue([
			row({ name: 'Verified', email_verified: true }),
			row({ name: 'Unverified' }),
			row({ name: 'Duplicate', email_verified: true, duplicate: true })
		])
		const { signatories, totalCount } = await list()

		expect(signatories.map(({ name }) => name)).toEqual(['Verified'])
		expect(totalCount).toBe(1)
	})

	it('never exposes an email, and hides the name of a private signature', async () => {
		fetchAllPages.mockResolvedValue([row({ email_verified: true, private: true })])
		const { signatories } = await list()

		expect(signatories[0].name).toBe('Anonymous')
		expect(JSON.stringify(signatories)).not.toContain('ada@example.org')
		expect(JSON.stringify(signatories)).not.toContain('Ada Lovelace')
	})
})
