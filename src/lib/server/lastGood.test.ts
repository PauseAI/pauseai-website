import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const blobs = vi.hoisted(() => ({
	get: vi.fn<(key: string, options?: unknown) => Promise<string | null>>(),
	set: vi.fn<(key: string, value: string) => Promise<void>>(),
	getStore: vi.fn()
}))
vi.mock('@netlify/blobs', () => ({ getStore: blobs.getStore }))
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()
vi.mock('$lib/server/sentry', () => ({ reportError }))
const env = vi.hoisted((): Record<string, string | undefined> => ({}))
vi.mock('$env/dynamic/private', () => ({ env }))

const { readLastGood, resetLastGoodForTests, saveLastGood } = await import('./lastGood')

const missingEnvironment = () => {
	const error = new Error('The environment has not been configured to use Netlify Blobs.')
	error.name = 'MissingBlobsEnvironmentError'
	return error
}

describe('lastGood', () => {
	beforeEach(() => {
		resetLastGoodForTests()
		env.CRM_INTAKE_URL = 'https://crm.example.org'
		blobs.get.mockReset().mockResolvedValue(null)
		blobs.set.mockReset().mockResolvedValue()
		blobs.getStore.mockReset().mockReturnValue({ get: blobs.get, set: blobs.set })
		reportError.mockReset().mockResolvedValue()
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

	it('writes only when the list changes', async () => {
		await saveLastGood('chapters', ['Germany'])
		await saveLastGood('chapters', ['Germany'])
		expect(blobs.set).toHaveBeenCalledExactlyOnceWith('crm.example.org/chapters', '["Germany"]')
		await saveLastGood('chapters', ['Germany', 'France'])
		expect(blobs.set).toHaveBeenCalledTimes(2)
	})

	it('does not write back a list it has just read', async () => {
		blobs.get.mockResolvedValue('["Germany"]')
		expect(await readLastGood('chapters', 1000)).toEqual(['Germany'])
		await saveLastGood('chapters', ['Germany'])
		expect(blobs.set).not.toHaveBeenCalled()
	})

	it('writes again after a failed write, and reports the failure', async () => {
		blobs.set.mockRejectedValueOnce(new Error('503'))
		await expect(saveLastGood('chapters', ['Germany'])).resolves.toBeUndefined()
		expect(reportError).toHaveBeenCalledOnce()
		await saveLastGood('chapters', ['Germany'])
		expect(blobs.set).toHaveBeenCalledTimes(2)
	})

	it('keeps each CRM host apart, and has no copy without one', async () => {
		await saveLastGood('chapters', ['Germany'])
		env.CRM_INTAKE_URL = 'https://staging.example.org'
		await saveLastGood('chapters', ['Germany'])
		expect(blobs.set.mock.calls.map(([key]) => key)).toEqual([
			'crm.example.org/chapters',
			'staging.example.org/chapters'
		])
		env.CRM_INTAKE_URL = undefined
		await saveLastGood('chapters', ['France'])
		expect(await readLastGood('chapters', 1000)).toBeUndefined()
		expect(blobs.set).toHaveBeenCalledTimes(2)
		expect(blobs.get).not.toHaveBeenCalled()
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
	})
})
