import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const blobs = vi.hoisted(() => ({
	get: vi.fn<(key: string, options?: unknown) => Promise<string | null>>(),
	set: vi.fn<(key: string, value: string) => Promise<void>>(),
	getStore: vi.fn()
}))
vi.mock('@netlify/blobs', () => ({ getStore: blobs.getStore }))
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()
const flushReports = vi.fn<() => Promise<void>>()
vi.mock('$lib/server/sentry', () => ({ reportError, flushReports }))
const env = vi.hoisted((): Record<string, string | undefined> => ({}))
vi.mock('$env/dynamic/private', () => ({ env }))

const { readLastGood, saveLastGood } = await import('./lastGood')

const missingEnvironment = () => {
	const error = new Error('The environment has not been configured to use Netlify Blobs.')
	error.name = 'MissingBlobsEnvironmentError'
	return error
}

describe('lastGood', () => {
	beforeEach(() => {
		env.CRM_INTAKE_URL = 'https://crm.example.org'
		blobs.get.mockReset().mockResolvedValue(null)
		blobs.set.mockReset().mockResolvedValue()
		blobs.getStore.mockReset().mockReturnValue({ get: blobs.get, set: blobs.set })
		reportError.mockReset().mockResolvedValue()
		flushReports.mockReset().mockResolvedValue()
	})
	afterEach(() => vi.useRealTimers())

	it('is no fallback, quietly, where Netlify provides no Blobs context', async () => {
		blobs.getStore.mockImplementation(() => {
			throw missingEnvironment()
		})
		await expect(saveLastGood('chapters', ['Germany'])).resolves.toBeUndefined()
		await expect(readLastGood('chapters', 1000)).resolves.toBeUndefined()
		expect(reportError).not.toHaveBeenCalled()
	})

	it('writes every good list', async () => {
		await saveLastGood('chapters', ['Germany'])
		await saveLastGood('chapters', ['Germany'])
		expect(blobs.set.mock.calls).toEqual([
			['https://crm.example.org/chapters', '["Germany"]'],
			['https://crm.example.org/chapters', '["Germany"]']
		])
	})

	it('reports a failed write, then sends the report', async () => {
		blobs.set.mockRejectedValueOnce(new Error('503'))
		await expect(saveLastGood('chapters', ['Germany'])).resolves.toBeUndefined()
		expect(reportError).toHaveBeenCalledOnce()
		expect(flushReports).toHaveBeenCalledOnce()
		expect(flushReports.mock.invocationCallOrder[0]).toBeGreaterThan(
			reportError.mock.invocationCallOrder[0]
		)
	})

	it('cuts a hung write off at its time limit, then reports it and sends the report', async () => {
		vi.useFakeTimers()
		blobs.set.mockReturnValue(new Promise(() => {}))
		const save = saveLastGood('chapters', ['Germany'])
		await vi.advanceTimersByTimeAsync(5000)
		await expect(save).resolves.toBeUndefined()
		expect(reportError).toHaveBeenCalledOnce()
		expect(flushReports).toHaveBeenCalledOnce()
	})

	it('keeps each CRM base URL apart, path included, and has no copy without one', async () => {
		env.CRM_INTAKE_URL = 'https://crm.example.org/production/'
		await saveLastGood('chapters', ['Germany'])
		env.CRM_INTAKE_URL = 'https://crm.example.org/staging'
		await saveLastGood('chapters', ['Germany'])
		expect(blobs.set.mock.calls.map(([key]) => key)).toEqual([
			'https://crm.example.org/production/chapters',
			'https://crm.example.org/staging/chapters'
		])
		env.CRM_INTAKE_URL = undefined
		await saveLastGood('chapters', ['France'])
		expect(await readLastGood('chapters', 1000)).toBeUndefined()
		expect(blobs.set).toHaveBeenCalledTimes(2)
		expect(blobs.get).not.toHaveBeenCalled()
	})

	it('reads the copy stored under its key', async () => {
		blobs.get.mockResolvedValue('["Germany"]')
		expect(await readLastGood('chapters', 1000)).toEqual(['Germany'])
		expect(blobs.get).toHaveBeenCalledExactlyOnceWith('https://crm.example.org/chapters', {
			type: 'text'
		})
	})

	it('cuts a slow read off at its timeout and reports it', async () => {
		vi.useFakeTimers()
		blobs.get.mockReturnValue(new Promise(() => {}))
		const read = readLastGood('chapters', 1000)
		await vi.advanceTimersByTimeAsync(1000)
		expect(await read).toBeUndefined()
		expect(reportError).toHaveBeenCalledOnce()
	})

	it('reports a failed read and a copy that is not JSON, without rejecting', async () => {
		blobs.get.mockRejectedValueOnce(new Error('network'))
		expect(await readLastGood('chapters', 1000)).toBeUndefined()
		blobs.get.mockResolvedValueOnce('not json')
		expect(await readLastGood('chapters', 1000)).toBeUndefined()
		expect(reportError).toHaveBeenCalledTimes(2)
		expect(flushReports).not.toHaveBeenCalled()
	})
})
