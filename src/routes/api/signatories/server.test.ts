import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchAllPages = vi.fn<(...args: unknown[]) => Promise<unknown[]>>()

const env: Record<string, string | undefined> = {}
const appEnvironment = vi.hoisted(() => ({ dev: false }))
const publicListFromCrm = vi.fn<() => Promise<unknown>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$app/environment', () => appEnvironment)
vi.mock('$lib/airtable.js', () => ({ fetchAllPages }))
vi.mock('$lib/server/statementCrm', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/server/statementCrm')>()),
	publicListFromCrm
}))

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
	env.STATEMENT_BACKEND = undefined
	appEnvironment.dev = false
	fetchAllPages.mockReset()
	publicListFromCrm.mockReset()
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

	it('asks Airtable only for verified rows and the fields it reads', async () => {
		fetchAllPages.mockResolvedValue([])
		await list()

		const params = fetchAllPages.mock.calls.at(-1)?.[3] as {
			filterByFormula: string
			fields: string[]
		}
		expect(params.filterByFormula).toBe('{email_verified}')
		expect([...params.fields].sort()).toEqual(
			['bio', 'country', 'date', 'duplicate', 'email', 'email_verified', 'name', 'private'].sort()
		)
	})

	it('lists only verified rows, and no duplicates among rows without an address', async () => {
		fetchAllPages.mockResolvedValue([
			row({ name: 'Verified', email_verified: true }),
			row({ name: 'Unverified', email: 'unverified@example.org' }),
			row({ name: 'Duplicate', email: undefined, email_verified: true, duplicate: true })
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

describe('GET /api/signatories: repeat rows', () => {
	const verified = (id: string, fields: Record<string, unknown>) => ({
		...row({ email_verified: true, ...fields }),
		id
	})

	it('lists and counts an address once, as its earliest row', async () => {
		fetchAllPages.mockResolvedValue([
			verified('later', { name: 'Later', date: '2026-03-01' }),
			verified('other', { name: 'Other', email: 'other@example.org', date: '2026-02-01' }),
			verified('earliest', { name: 'Earliest', date: '2026-01-01' })
		])
		const { signatories, totalCount } = await list()

		expect(signatories.map(({ name }) => name)).toEqual(['Earliest', 'Other'])
		expect(totalCount).toBe(2)
	})

	it('matches addresses regardless of case and surrounding space', async () => {
		fetchAllPages.mockResolvedValue([
			verified('a', { email: 'Ada@Example.org ', date: '2026-01-01' }),
			verified('b', { email: 'ada@example.org', date: '2026-02-01' })
		])

		expect((await list()).totalCount).toBe(1)
	})

	it('ignores an unverified earlier row, so a verified later one is still listed', async () => {
		fetchAllPages.mockResolvedValue([
			row({ name: 'Unverified', date: '2026-01-01' }),
			verified('later', { name: 'Later', date: '2026-02-01' })
		])
		const { signatories } = await list()

		expect(signatories.map(({ name }) => name)).toEqual(['Later'])
	})

	it('keeps an address anonymous if any of its rows asked to be', async () => {
		fetchAllPages.mockResolvedValue([
			verified('public', { date: '2026-01-01' }),
			verified('anonymous', { private: true, date: '2026-02-01' })
		])
		const { signatories, totalCount } = await list()

		expect(totalCount).toBe(1)
		expect(signatories[0].name).toBe('Anonymous')
	})

	it('lists someone who lost the first email and re-signed, on a row ticked duplicate', async () => {
		fetchAllPages.mockResolvedValue([
			row({ name: 'Never verified', date: '2026-01-01' }),
			verified('re-signed', { name: 'Re-signed', duplicate: true, date: '2026-03-01' })
		])
		const { signatories, totalCount } = await list()

		expect(signatories.map(({ name }) => name)).toEqual(['Re-signed'])
		expect(totalCount).toBe(1)
	})

	it('honours a request to be anonymous on a later row ticked duplicate', async () => {
		fetchAllPages.mockResolvedValue([
			verified('public', { date: '2026-01-01' }),
			verified('anonymous', { private: true, duplicate: true, date: '2026-03-01' })
		])
		const { signatories, totalCount } = await list()

		expect(totalCount).toBe(1)
		expect(signatories[0].name).toBe('Anonymous')
	})

	it('still counts an address once when its later row is ticked duplicate', async () => {
		fetchAllPages.mockResolvedValue([
			verified('earliest', { name: 'Earliest', date: '2026-01-01' }),
			verified('later', { name: 'Later', duplicate: true, date: '2026-03-01' })
		])
		const { signatories, totalCount } = await list()

		expect(signatories.map(({ name }) => name)).toEqual(['Earliest'])
		expect(totalCount).toBe(1)
	})

	it('keeps rows without an address, and puts rows without a date last', async () => {
		fetchAllPages.mockResolvedValue([
			verified('undated', { name: 'Undated', email: undefined, date: undefined }),
			verified('first', { name: 'First', email: undefined, date: '2026-01-01' }),
			verified('second', { name: 'Second', email: undefined, date: '2026-02-01' })
		])
		const { signatories } = await list()

		expect(signatories.map(({ name }) => name)).toEqual(['First', 'Second', 'Undated'])
	})
})

describe('GET /api/signatories: STATEMENT_BACKEND=civicrm', () => {
	beforeEach(() => {
		env.STATEMENT_BACKEND = 'civicrm'
	})

	it("serves CiviCRM's list as it comes, reading no Airtable table", async () => {
		const fromCrm = {
			totalCount: 2,
			signatories: [
				{
					private: false,
					name: 'Ada',
					country: 'France',
					bio: 'Hi',
					date: '2025-01-01T00:00:00.000Z'
				},
				{
					private: true,
					name: 'Anonymous',
					country: 'Spain',
					bio: 'Bio',
					date: '2026-01-01T00:00:00.000Z'
				}
			]
		}
		publicListFromCrm.mockResolvedValue(fromCrm)

		expect(await list()).toEqual(fromCrm)
		expect(fetchAllPages).not.toHaveBeenCalled()
	})

	it('throws when CiviCRM cannot be read, so the build fails instead of publishing no list', async () => {
		publicListFromCrm.mockResolvedValue(undefined)

		await expect(list()).rejects.toMatchObject({ status: 503 })
	})

	it('answers placeholder rows with a count of 0 on the dev server', async () => {
		appEnvironment.dev = true
		publicListFromCrm.mockResolvedValue(undefined)

		expect((await list()).totalCount).toBe(0)
	})

	it('keeps the hour-long public cache', async () => {
		publicListFromCrm.mockResolvedValue({ totalCount: 0, signatories: [] })
		const headers: Record<string, string>[] = []
		await GET({
			fetch,
			setHeaders: (value: Record<string, string>) => headers.push(value)
		} as never)

		expect(headers).toEqual([{ 'cache-control': 'public, max-age=3600' }])
	})
})
