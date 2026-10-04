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

const fetchMock = vi.fn<typeof fetch>()
const answer = (body: unknown, status = 200) =>
	fetchMock.mockImplementation(() =>
		Promise.resolve(new Response(JSON.stringify(body), { status }))
	)
const answerRow = (row: Record<string, unknown>) => answer({ values: [row] })

beforeEach(() => {
	for (const key of Object.keys(env)) delete env[key]
	env.CRM_INTAKE_ENABLED = 'true'
	env.CRM_INTAKE_URL = 'https://crm.example.org/'
	env.CRM_INTAKE_KEY = KEY
	fetchMock.mockReset()
	answerRow({ status: 'ok', contact_id: 7 })
	vi.stubGlobal('fetch', fetchMock)
	reportError.mockReset().mockResolvedValue()
	flushReports.mockReset().mockResolvedValue()
	vi.spyOn(console, 'log').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('submitToCrm', () => {
	it('posts the record and token as API4 params, with the key only in X-Civi-Auth', async () => {
		await submitToCrm(RECORD, TOKEN)
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
		expect(await submitToCrm(RECORD, '')).toEqual({ outcome: 'ok' })
		answerRow({ status: 'refused', reason: 'token_required' })
		expect(await submitToCrm(RECORD, '')).toEqual({ outcome: 'refused:token_required' })
	})

	it('calls an HTTP error, a malformed answer or an unknown refusal an error', async () => {
		// API4's masked answer, as CRM_Api4_Page_AJAX writes it.
		answer(
			{
				error_code: '1',
				error_message:
					'Sorry an error occurred and your request was not completed. (Error ID: aB3d-EfGh-1234)',
				status: 500
			},
			500
		)
		expect(await submitToCrm(RECORD, '')).toEqual({
			outcome: 'error',
			cause: 'http',
			httpStatus: 500,
			errorId: 'aB3d-EfGh-1234'
		})
		for (const body of [
			{ values: [] },
			{ values: [{ status: 'refused', reason: 'Not a code!' }] },
			'not json'
		]) {
			answer(body)
			expect(await submitToCrm(RECORD, '')).toEqual({
				outcome: 'error',
				cause: 'unexpected_response'
			})
		}
		fetchMock.mockImplementation(() => Promise.reject(new TypeError('fetch failed')))
		expect(await submitToCrm(RECORD, '')).toEqual({
			outcome: 'error',
			cause: 'network',
			errorName: 'TypeError'
		})
	})

	it('forwards no error text, only an error id of the shape the CRM mints', async () => {
		const echoed = `Invalid value ada@example.org for token ${TOKEN} (Error ID: ${TOKEN})`
		for (const body of [
			{ error_code: 0, error_message: echoed, status: 400 },
			{ error_id: 'ada@example.org', error_message: echoed, status: 400 }
		]) {
			answer(body, 400)
			expect(await submitToCrm(RECORD, TOKEN)).toEqual({
				outcome: 'error',
				cause: 'http',
				httpStatus: 400
			})
		}
		// The unmasked shape, which carries the id in its own field.
		answer({ error_id: 'Zx12-ab34-CD56', error_message: echoed, status: 500 }, 500)
		expect(await submitToCrm(RECORD, TOKEN)).toMatchObject({ errorId: 'Zx12-ab34-CD56' })

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		answer({ error_code: 0, error_message: echoed, status: 400 }, 400)
		expect(await reportToCrm(RECORD, TOKEN)).toBe('error')
		const reported = JSON.stringify([reportError.mock.calls, warn.mock.calls])
		for (const leaked of ['ada@example.org', TOKEN, 'Invalid value']) {
			expect(reported).not.toContain(leaked)
		}
	})

	// AbortSignal.timeout aborts with a DOMException named TimeoutError.
	const stubTimeout = () => {
		const timeout = new AbortController()
		const spy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeout.signal)
		const fire = () => timeout.abort(new DOMException('', 'TimeoutError'))
		return { signal: timeout.signal, spy, fire }
	}

	it('gives up when its timeout signal fires', async () => {
		const timeout = stubTimeout()
		fetchMock.mockImplementation(
			(_url, init) =>
				new Promise((_resolve, reject) =>
					init?.signal?.addEventListener('abort', () => reject(init.signal!.reason as Error))
				)
		)
		const pending = submitToCrm(RECORD, '')
		expect(timeout.spy).toHaveBeenCalledWith(TIMEOUT_MS)
		expect(fetchMock.mock.calls[0][1]?.signal).toBe(timeout.signal)
		timeout.fire()
		expect(await pending).toEqual({ outcome: 'error', cause: 'timeout', errorName: 'TimeoutError' })
	})

	it('counts a timeout while reading the answer as a timeout', async () => {
		const timeout = stubTimeout()
		const response = new Response('{}')
		vi.spyOn(response, 'json').mockImplementation(() => {
			timeout.fire()
			return Promise.reject(timeout.signal.reason as Error)
		})
		fetchMock.mockResolvedValue(response)
		expect(await submitToCrm(RECORD, '')).toEqual({ outcome: 'error', cause: 'timeout' })
	})

	it('does not call without a URL or key', async () => {
		for (const missing of ['CRM_INTAKE_URL', 'CRM_INTAKE_KEY']) {
			const saved = env[missing]
			delete env[missing]
			expect(await submitToCrm(RECORD, '')).toEqual({ outcome: 'error', cause: 'not_configured' })
			env[missing] = saved
		}
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('reportToCrm', () => {
	it('reports nothing on ok', async () => {
		expect(await reportToCrm(RECORD, '')).toBe('ok')
		expect(reportError).not.toHaveBeenCalled()
	})

	it('reports each refusal as its own issue, with the record id and code only', async () => {
		for (const reason of ['token_required', 'merged']) {
			answerRow({ status: 'refused', reason })
			expect(await reportToCrm(RECORD, TOKEN)).toBe(`refused:${reason}`)
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
		expect(await reportToCrm(RECORD, TOKEN)).toBe('error')
		const [, context, options] = reportError.mock.calls[0]
		expect(options).toEqual({ fingerprint: ['crm-intake', 'error'], level: 'error' })
		expect(context).toMatchObject({ outcome: 'error', cause: 'network' })
		const reported = JSON.stringify(reportError.mock.calls)
		expect(reported).toContain(RECORD.id)
		for (const secret of [KEY, TOKEN, 'ada@example.org', 'Ada Lovelace']) {
			expect(reported).not.toContain(secret)
		}
	})
})

describe('queueCrmIntake', () => {
	it('calls only when CRM_INTAKE_ENABLED is exactly "true"', async () => {
		for (const value of ['', 'false', '1']) {
			env.CRM_INTAKE_ENABLED = value
			queueCrmIntake(undefined, RECORD, '')
		}
		await new Promise((resolve) => setTimeout(resolve, 0))
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('still runs without a platform (the Node dev server)', async () => {
		queueCrmIntake(undefined, RECORD, '')
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
	})
})
