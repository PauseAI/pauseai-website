import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const reportError =
	vi.fn<(error: unknown, context?: Record<string, unknown>, options?: unknown) => Promise<void>>()
const flushReports = vi.fn<() => Promise<void>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError, flushReports }))

const {
	SIGN_MIN_ATTEMPT_MS,
	SIGN_RETRY_DELAY_MS,
	STATEMENT_VERSION,
	publicListFromCrm,
	signInCrm,
	statementBackend,
	verifyStatementInCrm
} = await import('./statementCrm.js')

const KEY = 'test-key-not-real'
const SIGNATURE = {
	name: 'Ada Lovelace',
	email: 'ada@example.org',
	country: 'United Kingdom',
	bio: 'I care about this.',
	private: true,
	language: 'es' as const
}

const fetchMock = vi.fn<typeof fetch>()
const reply = (body: unknown, status = 200) =>
	Promise.resolve(new Response(JSON.stringify(body), { status }))
const answerRow = (row: Record<string, unknown>) =>
	fetchMock.mockImplementation(() => reply({ values: [row] }))
const networkError = () => Promise.reject(new TypeError('fetch failed'))

// signStatement's deadline, measured from when Turnstile has answered quickly.
const DEADLINE_MS = 19_500
const sign = (options: Parameters<typeof signInCrm>[1] = { deadline: Date.now() + DEADLINE_MS }) =>
	signInCrm(SIGNATURE, options)

const calledUrl = (call = 0) => fetchMock.mock.calls[call][0]
const sentParams = (call = 0) =>
	JSON.parse((fetchMock.mock.calls[call][1]?.body as URLSearchParams).get('params')!) as Record<
		string,
		unknown
	>

/** Runs a sign with fake timers, waiting out the retry delay, and returns its result. */
async function signThroughRetries() {
	vi.useFakeTimers()
	const pending = sign()
	await vi.advanceTimersByTimeAsync(SIGN_RETRY_DELAY_MS)
	return pending
}

beforeEach(() => {
	for (const key of Object.keys(env)) delete env[key]
	env.CRM_INTAKE_URL = 'https://crm.example.org'
	env.CRM_INTAKE_KEY = KEY
	fetchMock.mockReset()
	answerRow({ status: 'ok' })
	vi.stubGlobal('fetch', fetchMock)
	reportError.mockReset().mockResolvedValue()
	flushReports.mockReset().mockResolvedValue()
	vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
	vi.useRealTimers()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('statementBackend', () => {
	it('is Airtable unless STATEMENT_BACKEND is exactly "civicrm"', () => {
		for (const value of [undefined, '', 'airtable', 'CiviCRM', 'true']) {
			env.STATEMENT_BACKEND = value
			expect(statementBackend()).toBe('airtable')
		}
		env.STATEMENT_BACKEND = 'civicrm'
		expect(statementBackend()).toBe('civicrm')
	})
})

describe('signInCrm', () => {
	it("sends sign's parameters, the country as its ISO code", async () => {
		expect(await sign()).toBe('ok')

		expect(calledUrl()).toBe('https://crm.example.org/civicrm/ajax/api4/PauseaiStatement/sign')
		const params = sentParams()
		expect(params).toEqual({
			name: 'Ada Lovelace',
			email: 'ada@example.org',
			country: 'GB',
			bio: 'I care about this.',
			private: true,
			email_language: 'es',
			statement_version: STATEMENT_VERSION,
			submission_id: expect.stringMatching(/^[A-Za-z0-9._:-]{8,128}$/) as unknown
		})
		expect(params).not.toHaveProperty('language')
		expect(reportError).not.toHaveBeenCalled()
	})

	it('mints a new submission_id for each submission', async () => {
		await sign()
		await sign()

		expect(sentParams(0).submission_id).not.toBe(sentParams(1).submission_id)
	})

	it('retries a network error once after about 1 s, with the same submission_id', async () => {
		fetchMock
			.mockImplementationOnce(networkError)
			.mockImplementationOnce(() => reply({ values: [{ status: 'ok' }] }))
		vi.useFakeTimers()
		const pending = sign()

		await vi.advanceTimersByTimeAsync(SIGN_RETRY_DELAY_MS - 1)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		await vi.advanceTimersByTimeAsync(1)

		expect(await pending).toBe('ok')
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(sentParams(0).submission_id).toBe(sentParams(1).submission_id)
		expect(reportError).not.toHaveBeenCalled()
	})

	it('gives up after a failed retry and reports it once, without personal data or the key', async () => {
		fetchMock.mockImplementation(() => reply({ error_message: 'busy' }, 503))

		expect(await signThroughRetries()).toBe('failed')
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(reportError).toHaveBeenCalledOnce()
		const [error, context, options] = reportError.mock.calls[0]
		expect((error as Error).message).toBe('CRM statement sign error')
		expect(context).toMatchObject({ cause: 'http', httpStatus: 503, attempt: 2 })
		expect(options).toEqual({ fingerprint: ['crm-statement', 'sign', 'error'], level: 'error' })
		expect(flushReports).toHaveBeenCalled()
		const reported = JSON.stringify([reportError.mock.calls, vi.mocked(console.warn).mock.calls])
		for (const secret of [KEY, 'ada@example.org', 'Ada Lovelace', 'I care']) {
			expect(reported).not.toContain(secret)
		}
	})

	it('caps each attempt to what is left before the deadline, and skips a retry with too little', async () => {
		vi.useFakeTimers()
		const timeouts = vi.spyOn(AbortSignal, 'timeout')
		fetchMock.mockImplementation(networkError)

		const tooLittle = SIGN_RETRY_DELAY_MS + SIGN_MIN_ATTEMPT_MS - 500
		expect(await sign({ deadline: Date.now() + tooLittle })).toBe('failed')
		expect(timeouts.mock.calls).toEqual([[tooLittle]])

		timeouts.mockClear()
		const enough = SIGN_RETRY_DELAY_MS + SIGN_MIN_ATTEMPT_MS + 500
		const pending = sign({ deadline: Date.now() + enough })
		await vi.advanceTimersByTimeAsync(SIGN_RETRY_DELAY_MS)
		expect(await pending).toBe('failed')
		expect(timeouts.mock.calls).toEqual([[enough], [SIGN_MIN_ATTEMPT_MS + 500]])
		expect(fetchMock).toHaveBeenCalledTimes(3)
	})

	it('reports after the response when the platform can wait for it', async () => {
		fetchMock.mockImplementation(() => reply({}, 403))
		let finishFlush = () => {}
		flushReports.mockReturnValue(new Promise<void>((resolve) => (finishFlush = resolve)))
		const waitUntil = vi.fn<(promise: Promise<unknown>) => void>()

		const result = await sign({
			deadline: Date.now() + DEADLINE_MS,
			platform: { context: { waitUntil } } as unknown as App.Platform
		})

		expect(result).toBe('failed')
		expect(waitUntil).toHaveBeenCalledOnce()
		finishFlush()
		await waitUntil.mock.calls[0][0]
		expect(reportError).toHaveBeenCalledOnce()
	})

	it.each([
		['a 4xx', () => reply({ error_message: 'Forbidden' }, 403)],
		['an answer of the wrong shape', () => reply({ values: [] })]
	])('does not retry %s', async (_label, response) => {
		fetchMock.mockImplementation(response)

		expect(await signThroughRetries()).toBe('failed')
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(reportError).toHaveBeenCalledOnce()
	})

	it('does not call without a URL or key', async () => {
		delete env.CRM_INTAKE_KEY

		expect(await sign()).toBe('failed')
		expect(fetchMock).not.toHaveBeenCalled()
		expect(reportError.mock.calls[0][1]).toMatchObject({ cause: 'not_configured' })
	})

	it('passes a refusal on, unretried, reported as a warning with its code', async () => {
		answerRow({ status: 'refused', reason: 'invalid_request' })

		expect(await signThroughRetries()).toBe('refused')
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(reportError.mock.calls[0][2]).toEqual({
			fingerprint: ['crm-statement', 'sign', 'refused:invalid_request'],
			level: 'warning'
		})
	})
})

describe('verifyStatementInCrm', () => {
	it("sends the link's key and token as they arrived", async () => {
		await verifyStatementInCrm('s12345', 'v1.1800000000.abc')

		expect(calledUrl()).toBe('https://crm.example.org/civicrm/ajax/api4/PauseaiStatement/verify')
		expect(sentParams()).toEqual({ key: 's12345', token: 'v1.1800000000.abc' })
	})

	it.each(['ok', 'expired', 'invalid'])('answers %s as CiviCRM does', async (status) => {
		answerRow({ status })

		expect(await verifyStatementInCrm('s1', 't')).toBe(status)
		expect(reportError).not.toHaveBeenCalled()
	})

	it('reports an error or an unknown answer as failed', async () => {
		fetchMock.mockImplementation(() => reply({}, 500))
		expect(await verifyStatementInCrm('s1', 't')).toBe('failed')
		answerRow({ status: 'something_new' })
		expect(await verifyStatementInCrm('s1', 't')).toBe('failed')
		expect(reportError).toHaveBeenCalledTimes(2)
	})
})

describe('publicListFromCrm', () => {
	const LIST = {
		totalCount: 2,
		signatories: [
			{
				private: false,
				name: 'Ada Lovelace',
				country: 'United Kingdom',
				bio: 'Mathematician',
				date: '2025-01-02T10:00:00.000Z'
			},
			{
				private: true,
				name: 'Anonymous',
				country: 'Spain',
				bio: 'Kept on a private row',
				date: '2026-01-02T10:00:00.000Z'
			}
		]
	}

	it('passes the list through in the shape /api/signatories serves', async () => {
		answerRow(LIST)

		expect(await publicListFromCrm()).toEqual(LIST)
		expect(calledUrl()).toBe(
			'https://crm.example.org/civicrm/ajax/api4/PauseaiStatement/publicList'
		)
		expect(sentParams()).toEqual({})
	})

	it('keeps only the five public fields of a row', async () => {
		answerRow({ ...LIST, signatories: [{ ...LIST.signatories[0], email: 'ada@example.org' }] })

		expect((await publicListFromCrm())?.signatories).toEqual([LIST.signatories[0]])
	})

	it('answers undefined, and reports, when the list cannot be read', async () => {
		fetchMock.mockImplementation(networkError)
		expect(await publicListFromCrm()).toBeUndefined()
		answerRow({ status: 'ok' })
		expect(await publicListFromCrm()).toBeUndefined()
		expect(reportError).toHaveBeenCalledTimes(2)
	})
})
