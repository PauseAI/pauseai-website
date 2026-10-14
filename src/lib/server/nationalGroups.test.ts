import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fetchAllPages = vi.fn<(...args: unknown[]) => Promise<unknown[]>>()
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()
vi.mock('$lib/airtable.js', () => ({ fetchAllPages }))
vi.mock('$lib/server/sentry', () => ({ reportError }))

const { getNationalGroups, resetNationalGroupsCacheForTests } = await import('./nationalGroups')

const records = (...countries: string[]) =>
	countries.map((country, index) => ({ id: `rec${index}`, fields: { country } }))
const names = (groups: { name: string }[] | null) => groups?.map((group) => group.name) ?? null

describe('getNationalGroups', () => {
	beforeEach(() => {
		resetNationalGroupsCacheForTests()
		fetchAllPages.mockReset()
		reportError.mockReset().mockResolvedValue()
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.useFakeTimers()
	})
	afterEach(() => vi.useRealTimers())

	it('reads Airtable once per ten minutes, sharing a read in flight', async () => {
		fetchAllPages.mockResolvedValue(records('Germany', 'France'))
		const [first, second] = await Promise.all([getNationalGroups(), getNationalGroups()])
		expect(names(first)).toEqual(['France', 'Germany'])
		expect(second).toBe(first)
		vi.advanceTimersByTime(10 * 60 * 1000 - 1)
		await getNationalGroups()
		expect(fetchAllPages).toHaveBeenCalledOnce()
		vi.advanceTimersByTime(1)
		fetchAllPages.mockResolvedValue(records('Italy'))
		expect(names(await getNationalGroups())).toEqual(['Italy'])
		expect(fetchAllPages).toHaveBeenCalledTimes(2)
	})

	it('serves the last good list when a read fails, and null when there was none', async () => {
		fetchAllPages.mockRejectedValueOnce(new Error('down'))
		expect(await getNationalGroups()).toBeNull()
		vi.advanceTimersByTime(60 * 1000)
		fetchAllPages.mockResolvedValueOnce(records('Germany'))
		expect(names(await getNationalGroups())).toEqual(['Germany'])
		vi.advanceTimersByTime(10 * 60 * 1000)
		fetchAllPages.mockRejectedValueOnce(new Error('down'))
		expect(names(await getNationalGroups())).toEqual(['Germany'])
		expect(reportError).toHaveBeenCalledTimes(2)
		expect(reportError.mock.calls[1][1]).toMatchObject({ servedStale: true })
	})

	it('waits a minute after a failed read before trying again, serving the last good list', async () => {
		fetchAllPages.mockResolvedValueOnce(records('Germany'))
		await getNationalGroups()
		vi.advanceTimersByTime(10 * 60 * 1000)
		fetchAllPages.mockRejectedValue(new Error('down'))
		for (let call = 0; call < 3; call++) {
			expect(names(await getNationalGroups())).toEqual(['Germany'])
		}
		expect(fetchAllPages).toHaveBeenCalledTimes(2)
		expect(reportError).toHaveBeenCalledOnce()
		vi.advanceTimersByTime(60 * 1000 - 1)
		await getNationalGroups()
		expect(fetchAllPages).toHaveBeenCalledTimes(2)
		vi.advanceTimersByTime(1)
		fetchAllPages.mockResolvedValue(records('France'))
		expect(names(await getNationalGroups())).toEqual(['France'])
		expect(fetchAllPages).toHaveBeenCalledTimes(3)
	})

	it('waits a minute after a failed first read too, serving nothing', async () => {
		fetchAllPages.mockRejectedValue(new Error('down'))
		expect(await getNationalGroups()).toBeNull()
		expect(await getNationalGroups()).toBeNull()
		expect(fetchAllPages).toHaveBeenCalledOnce()
	})

	it('stops waiting for a read after five seconds', async () => {
		fetchAllPages.mockReturnValue(new Promise(() => {}))
		const groups = getNationalGroups()
		await vi.advanceTimersByTimeAsync(5000)
		expect(await groups).toBeNull()
		expect(reportError).toHaveBeenCalledOnce()
	})
})
