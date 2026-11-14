import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CrmRows } from '$lib/server/crmIntake'

const callCrmRows =
	vi.fn<(action: string, params: unknown, timeoutMs?: number) => Promise<CrmRows>>()
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()
const reportMessage = vi.fn<(message: string, context?: Record<string, unknown>) => Promise<void>>()
const appEnvironment = vi.hoisted(() => ({ dev: false }))
vi.mock('$lib/server/crmIntake', async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	callCrmRows
}))
vi.mock('$app/environment', () => appEnvironment)
const flushReports = vi.fn<() => Promise<void>>()
vi.mock('$lib/server/sentry', () => ({ reportError, reportMessage, flushReports }))
// No CRM settings, and no CI: what a deployed runtime missing its settings may look like.
vi.mock('$env/dynamic/private', () => ({ env: {} }))

const { getNationalGroups, nationalGroupsReportsSent, resetNationalGroupsCacheForTests } =
	await import('./nationalGroups')
const crm = await vi.importActual<typeof import('$lib/server/crmIntake')>('$lib/server/crmIntake')

const rows = (...countries: string[]): CrmRows => ({
	ok: true,
	rows: countries.map((country) => ({ country, leaders: [], image: null }))
})
const down: CrmRows = { ok: false, cause: 'http', httpStatus: 500 }
const names = (groups: { name: string }[] | null) => groups?.map((group) => group.name) ?? null

describe('getNationalGroups', () => {
	beforeEach(() => {
		resetNationalGroupsCacheForTests()
		appEnvironment.dev = false
		callCrmRows.mockReset()
		reportError.mockReset().mockResolvedValue()
		reportMessage.mockReset().mockResolvedValue()
		flushReports.mockReset().mockResolvedValue()
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.useFakeTimers()
	})
	afterEach(() => vi.useRealTimers())

	it('maps each publicList row to a national group', async () => {
		callCrmRows.mockResolvedValue({
			ok: true,
			rows: [
				{
					country: 'United Kingdom',
					website: 'https://pauseai.uk/',
					website_email: null,
					discord: 'https://discord.gg/uk',
					luma: null,
					leaders: ['Ada Lovelace', 'Alan Turing'],
					image: 'https://crm.example/public/media/chapter-images/1-abc.png'
				},
				{ country: 'Sweden', website: null, leaders: [], image: null }
			]
		})
		const [sweden, uk] = (await getNationalGroups())!
		expect(callCrmRows).toHaveBeenCalledWith('PauseaiChapterDetails/publicList', {}, 5000)
		expect(uk).toMatchObject({
			id: 'United Kingdom',
			name: 'United Kingdom',
			leader: 'Ada Lovelace, Alan Turing',
			email: '',
			website: 'https://pauseai.uk/',
			discordLink: 'https://discord.gg/uk',
			lumaLink: '',
			public: true,
			image: 'https://crm.example/public/media/chapter-images/1-abc.png'
		})
		expect(sweden).toMatchObject({ name: 'Sweden', leader: 'No', website: '', email: '' })
		expect(sweden.image).toBeUndefined()
	})

	it('reads the CRM once per ten minutes, sharing a read in flight', async () => {
		callCrmRows.mockResolvedValue(rows('Germany', 'France'))
		const [first, second] = await Promise.all([getNationalGroups(), getNationalGroups()])
		expect(names(first)).toEqual(['France', 'Germany'])
		expect(second).toBe(first)
		vi.advanceTimersByTime(10 * 60 * 1000 - 1)
		await getNationalGroups()
		expect(callCrmRows).toHaveBeenCalledOnce()
		vi.advanceTimersByTime(1)
		callCrmRows.mockResolvedValue(rows('Italy'))
		expect(names(await getNationalGroups())).toEqual(['Italy'])
		expect(callCrmRows).toHaveBeenCalledTimes(2)
	})

	it('serves the last good list when a read fails, and null when there was none', async () => {
		callCrmRows.mockResolvedValueOnce(down)
		expect(await getNationalGroups()).toBeNull()
		expect(reportError.mock.calls[0][1]).toMatchObject({ servedStale: false })
		vi.advanceTimersByTime(60 * 1000)
		callCrmRows.mockResolvedValueOnce(rows('Germany'))
		expect(names(await getNationalGroups())).toEqual(['Germany'])
		vi.advanceTimersByTime(10 * 60 * 1000)
		callCrmRows.mockResolvedValueOnce(down)
		expect(names(await getNationalGroups())).toEqual(['Germany'])
		expect(reportError).toHaveBeenCalledTimes(2)
		expect(reportError.mock.calls[1][1]).toMatchObject({ servedStale: true })
	})

	it('treats an empty list as a failed read, serving the last good list', async () => {
		callCrmRows.mockResolvedValueOnce(rows('Germany'))
		await getNationalGroups()
		vi.advanceTimersByTime(10 * 60 * 1000)
		callCrmRows.mockResolvedValueOnce(rows())
		expect(names(await getNationalGroups())).toEqual(['Germany'])
		expect(reportError).toHaveBeenCalledOnce()
		expect(reportError.mock.calls[0][1]).toMatchObject({ servedStale: true })
	})

	it('waits a minute after a failed read before trying again, serving the last good list', async () => {
		callCrmRows.mockResolvedValueOnce(rows('Germany'))
		await getNationalGroups()
		vi.advanceTimersByTime(10 * 60 * 1000)
		callCrmRows.mockResolvedValue({ ok: false, cause: 'timeout' })
		for (let call = 0; call < 3; call++) {
			expect(names(await getNationalGroups())).toEqual(['Germany'])
		}
		expect(callCrmRows).toHaveBeenCalledTimes(2)
		expect(reportError).toHaveBeenCalledOnce()
		vi.advanceTimersByTime(60 * 1000 - 1)
		await getNationalGroups()
		expect(callCrmRows).toHaveBeenCalledTimes(2)
		vi.advanceTimersByTime(1)
		callCrmRows.mockResolvedValue(rows('France'))
		expect(names(await getNationalGroups())).toEqual(['France'])
		expect(callCrmRows).toHaveBeenCalledTimes(3)
	})

	it('waits a minute after a failed first read too, serving nothing', async () => {
		callCrmRows.mockResolvedValue(down)
		expect(await getNationalGroups()).toBeNull()
		expect(await getNationalGroups()).toBeNull()
		expect(callCrmRows).toHaveBeenCalledOnce()
	})

	it('treats a CRM that is not configured as a failure outside development', async () => {
		callCrmRows.mockImplementation(crm.callCrmRows)
		expect(await getNationalGroups()).toBeNull()
		expect(reportError).toHaveBeenCalledOnce()
		expect(reportError.mock.calls[0][1]).toMatchObject({ cause: 'not_configured' })
	})

	it('sends a failed read report without the read waiting for it', async () => {
		let sent = false
		let send: () => void = () => {}
		flushReports.mockReturnValue(
			new Promise<void>((resolve) => (send = resolve)).then(() => {
				sent = true
			})
		)
		callCrmRows.mockResolvedValue(down)
		expect(await getNationalGroups()).toBeNull()
		expect(flushReports).toHaveBeenCalledOnce()
		expect(sent).toBe(false)
		const reportsSent = nationalGroupsReportsSent()
		send()
		await reportsSent
		expect(sent).toBe(true)
	})

	it('sends no report after a good read', async () => {
		callCrmRows.mockResolvedValue(rows('Germany'))
		await getNationalGroups()
		expect(flushReports).not.toHaveBeenCalled()
	})

	it('reports what caused a failed read', async () => {
		callCrmRows.mockResolvedValue({ ok: false, cause: 'network', errorName: 'TypeError' })
		await getNationalGroups()
		expect(reportError.mock.calls[0][1]).toMatchObject({ cause: 'network', errorName: 'TypeError' })
	})

	it('reports an outage once, then hourly with how long it has lasted, then its recovery', async () => {
		const minute = 60 * 1000
		callCrmRows.mockResolvedValueOnce(rows('Germany'))
		await getNationalGroups()
		vi.advanceTimersByTime(10 * minute)
		const failingSince = new Date().toISOString()
		callCrmRows.mockResolvedValue(down)
		await getNationalGroups()
		expect(reportError).toHaveBeenCalledOnce()
		expect(reportError.mock.calls[0][1]).toMatchObject({
			operation: 'getNationalGroups',
			servedStale: true,
			cause: 'http',
			failingSince,
			failingForMinutes: 0
		})
		expect(flushReports).toHaveBeenCalledOnce()

		vi.advanceTimersByTime(59 * minute)
		await getNationalGroups()
		expect(reportError).toHaveBeenCalledOnce()
		expect(flushReports).toHaveBeenCalledOnce()

		vi.advanceTimersByTime(minute)
		await getNationalGroups()
		expect(reportError).toHaveBeenCalledTimes(2)
		expect(reportError.mock.calls[1][1]).toMatchObject({ failingSince, failingForMinutes: 60 })
		expect(flushReports).toHaveBeenCalledTimes(2)

		vi.advanceTimersByTime(minute)
		callCrmRows.mockResolvedValue(rows('France'))
		expect(names(await getNationalGroups())).toEqual(['France'])
		expect(reportMessage).toHaveBeenCalledExactlyOnceWith(
			'Chapter directory reads recovered',
			expect.objectContaining({ failingSince, failingForMinutes: 61 })
		)
		expect(flushReports).toHaveBeenCalledTimes(3)

		vi.advanceTimersByTime(10 * minute)
		await getNationalGroups()
		expect(reportMessage).toHaveBeenCalledOnce()
		expect(flushReports).toHaveBeenCalledTimes(3)

		vi.advanceTimersByTime(10 * minute)
		callCrmRows.mockResolvedValue(down)
		await getNationalGroups()
		expect(reportError).toHaveBeenCalledTimes(3)
		expect(reportError.mock.calls[2][1]).toMatchObject({
			failingSince: new Date().toISOString(),
			failingForMinutes: 0
		})
	})

	it('serves example groups in development when the CRM is not configured', async () => {
		appEnvironment.dev = true
		callCrmRows.mockImplementation(crm.callCrmRows)
		expect(names(await getNationalGroups())).toEqual([
			'[FALLBACK DATA] Example Group 1',
			'[FALLBACK DATA] Example Group 2'
		])
		expect(reportError).not.toHaveBeenCalled()
	})

	it('treats any other failure as a failure in development too', async () => {
		appEnvironment.dev = true
		callCrmRows.mockResolvedValue(down)
		expect(await getNationalGroups()).toBeNull()
		expect(reportError).toHaveBeenCalledOnce()
	})
})
