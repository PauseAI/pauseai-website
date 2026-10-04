import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const reportError =
	vi.fn<(error: unknown, context?: Record<string, unknown>, options?: unknown) => Promise<void>>()
const flushReports = vi.fn<() => Promise<void>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError, flushReports }))

const { TIMEOUT_MS, queueCrmIntake, reportToCrm, submitToCrm } = await import('./crmIntake.js')

const KEY = 'test-key-not-real'
const RECORD = {
	id: 'recAbcdefghijklmn',
	createdTime: '2026-10-04T12:00:00.000Z',
	fields: { Email: 'ada@example.org', 'Full name': 'Ada Lovelace', Intent: 'None' }
}
const TOKEN = 'v1.1800000000.' + 'A'.repeat(43)

const answer = (body: unknown, status = 200) =>
	Promise.resolve(new Response(JSON.stringify(body), { status }))
const values = (row: Record<string, unknown>) => answer({ values: [row] })

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
	for (const key of Object.keys(env)) delete env[key]
	env.CRM_INTAKE_ENABLED = 'true'
	env.CRM_INTAKE_URL = 'https://crm.example.org/'
	env.CRM_INTAKE_KEY = KEY
	fetchMock.mockReset().mockImplementation(() => values({ status: 'ok', contact_id: 7 }))
	reportError.mockReset().mockResolvedValue()
	flushReports.mockReset().mockResolvedValue()
	vi.spyOn(console, 'log').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => vi.useRealTimers())

describe('submitToCrm', () => {
	it('posts the record and token as API4 params, with the key only in X-Civi-Auth', async () => {
		await submitToCrm(RECORD, TOKEN, fetchMock)
		expect(fetchMock).toHaveBeenCalledOnce()
		const [url, init] = fetchMock.mock.calls[0]
		expect(url).toBe('https://crm.example.org/civicrm/ajax/api4/PauseaiMemberIntake/submit')
		expect(init?.method).toBe('POST')
		expect(init?.headers).toEqual({
			'X-Civi-Auth': `Bearer ${KEY}`,
			'X-Requested-With': 'XMLHttpRequest',
			'Content-Type': 'application/x-www-form-urlencoded'
		})
		const body = init?.body as URLSearchParams
		expect([...body.keys()]).toEqual(['params'])
		expect(JSON.parse(body.get('params')!)).toEqual({ record: RECORD, token: TOKEN })
		expect(body.toString()).not.toContain(KEY)
	})

	it('reads the outcome from values[0]', async () => {
		expect((await submitToCrm(RECORD, '', fetchMock)).outcome).toBe('ok')
		fetchMock.mockImplementation(() => values({ status: 'refused', reason: 'token_required' }))
		expect((await submitToCrm(RECORD, '', fetchMock)).outcome).toBe('refused:token_required')
	})

	it('calls an HTTP error, a malformed answer or an unknown refusal an error', async () => {
		fetchMock.mockImplementation(() =>
			answer({ error_code: 0, error_message: 'Sorry an error occurred (id 12)', status: 500 }, 500)
		)
		expect(await submitToCrm(RECORD, '', fetchMock)).toEqual({
			outcome: 'error',
			context: { cause: 'http', httpStatus: 500, errorMessage: 'Sorry an error occurred (id 12)' }
		})
		for (const body of [
			{ values: [] },
			{ values: [{ status: 'refused', reason: 'Not a code!' }] },
			'not json'
		]) {
			fetchMock.mockImplementation(() => answer(body))
			expect(await submitToCrm(RECORD, '', fetchMock)).toEqual({
				outcome: 'error',
				context: { cause: 'unexpected_response' }
			})
		}
		fetchMock.mockImplementation(() => Promise.reject(new TypeError('fetch failed')))
		expect((await submitToCrm(RECORD, '', fetchMock)).context).toMatchObject({ cause: 'network' })
	})

	it('gives up after the timeout', async () => {
		vi.useFakeTimers()
		fetchMock.mockImplementation(
			(_url, init) =>
				new Promise((_resolve, reject) =>
					init?.signal?.addEventListener('abort', () => reject(new DOMException('', 'AbortError')))
				)
		)
		const pending = submitToCrm(RECORD, '', fetchMock)
		await vi.advanceTimersByTimeAsync(TIMEOUT_MS - 1)
		expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(false)
		await vi.advanceTimersByTimeAsync(1)
		expect(await pending).toEqual({
			outcome: 'error',
			context: { cause: 'timeout', errorName: 'AbortError' }
		})
		expect(TIMEOUT_MS).toBe(3000)
	})

	it('does not call without a URL or key', async () => {
		for (const missing of ['CRM_INTAKE_URL', 'CRM_INTAKE_KEY']) {
			const saved = env[missing]
			delete env[missing]
			expect(await submitToCrm(RECORD, '', fetchMock)).toEqual({
				outcome: 'error',
				context: { cause: 'not_configured' }
			})
			env[missing] = saved
		}
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('reportToCrm', () => {
	it('reports nothing on ok', async () => {
		expect(await reportToCrm(RECORD, '', fetchMock)).toBe('ok')
		expect(reportError).not.toHaveBeenCalled()
	})

	it('reports each refusal as its own issue, with the record id and code only', async () => {
		for (const reason of ['token_required', 'merged']) {
			fetchMock.mockImplementation(() => values({ status: 'refused', reason }))
			expect(await reportToCrm(RECORD, TOKEN, fetchMock)).toBe(`refused:${reason}`)
			const [error, context, options] = reportError.mock.calls.at(-1)!
			expect((error as Error).message).toBe(`CRM intake refused:${reason}`)
			expect(context).toEqual({
				check: 'crm-intake',
				recordId: RECORD.id,
				outcome: `refused:${reason}`
			})
			expect(options).toEqual({
				fingerprint: ['crm-intake', `refused:${reason}`],
				level: 'warning'
			})
		}
		expect(flushReports).toHaveBeenCalledTimes(2)
	})

	it('reports an error apart from refusals, never with personal data or the key', async () => {
		fetchMock.mockImplementation(() => Promise.reject(new TypeError('fetch failed')))
		expect(await reportToCrm(RECORD, TOKEN, fetchMock)).toBe('error')
		const [, context, options] = reportError.mock.calls[0]
		expect(options).toEqual({ fingerprint: ['crm-intake', 'error'], level: 'error' })
		const reported = JSON.stringify(reportError.mock.calls)
		expect(reported).toContain(RECORD.id)
		for (const secret of [KEY, TOKEN, 'ada@example.org', 'Ada Lovelace']) {
			expect(reported).not.toContain(secret)
		}
		expect(context).toMatchObject({ outcome: 'error', cause: 'network' })
	})

	it('never rejects, even when reporting throws', async () => {
		fetchMock.mockImplementation(() => values({ status: 'refused', reason: 'merged' }))
		reportError.mockRejectedValue(new Error('sentry down'))
		vi.spyOn(console, 'error').mockImplementation(() => {})
		expect(await reportToCrm(RECORD, '', fetchMock)).toBe('error')
	})
})

describe('queueCrmIntake', () => {
	beforeEach(() => vi.stubGlobal('fetch', fetchMock))
	afterEach(() => vi.unstubAllGlobals())

	it('hands the call to waitUntil when the flag is on', async () => {
		const waitUntil = vi.fn<(promise: Promise<unknown>) => void>()
		queueCrmIntake({ context: { waitUntil } }, RECORD, '')
		expect(waitUntil).toHaveBeenCalledOnce()
		expect(await waitUntil.mock.calls[0][0]).toBe('ok')
		expect(fetchMock).toHaveBeenCalledOnce()
	})

	it('still runs without a platform', async () => {
		queueCrmIntake(undefined, RECORD, '')
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
	})

	it('does nothing unless CRM_INTAKE_ENABLED is "true"', () => {
		const waitUntil = vi.fn<(promise: Promise<unknown>) => void>()
		for (const value of [undefined, '', 'false', '1']) {
			env.CRM_INTAKE_ENABLED = value
			queueCrmIntake({ context: { waitUntil } }, RECORD, '')
		}
		expect(waitUntil).not.toHaveBeenCalled()
		expect(fetchMock).not.toHaveBeenCalled()
	})
})
