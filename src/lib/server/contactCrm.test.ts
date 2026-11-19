import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const reportError =
	vi.fn<(error: unknown, context?: Record<string, unknown>, options?: unknown) => Promise<void>>()
const flushReports = vi.fn<() => Promise<void>>()

vi.mock('$app/environment', () => ({ dev: false }))
vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError, flushReports }))

const { sendContactToCrm } = await import('./contactCrm.js')
const { CRM_MIN_ATTEMPT_MS, CRM_RETRY_DELAY_MS } = await import('./crmIntake.js')

const KEY = 'test-key-not-real'
const REQUEST = {
	type: 'Partnerships' as const,
	name: 'Ada Lovelace',
	email: 'ada@example.org',
	subject: 'Other: analytical engines',
	message: 'Shall we work together?',
	organization: 'Difference Ltd',
	city_country: 'London, UK'
}
const SUBMITTED = [
	'Ada Lovelace',
	'ada@example.org',
	'analytical engines',
	'Shall we work',
	'Difference',
	'London'
]

const fetchMock = vi.fn<typeof fetch>()
const reply = (body: unknown, status = 200) =>
	Promise.resolve(new Response(JSON.stringify(body), { status }))
const answerRow = (row: Record<string, unknown>) =>
	fetchMock.mockImplementation(() => reply({ values: [row] }))
const networkError = () => Promise.reject(new TypeError('fetch failed'))

// The action's deadline, measured from when Turnstile has answered quickly.
const DEADLINE_MS = 19_500
const send = (
	options: Partial<Parameters<typeof sendContactToCrm>[1]> = {},
	request: Parameters<typeof sendContactToCrm>[0] = REQUEST
) =>
	sendContactToCrm(request, {
		deadline: Date.now() + DEADLINE_MS,
		hostname: 'pauseai.info',
		...options
	})

const sentParams = (call = 0) =>
	JSON.parse((fetchMock.mock.calls[call][1]?.body as URLSearchParams).get('params')!) as Record<
		string,
		unknown
	>

/** Runs a send with fake timers, waiting out the retry delay, and returns its result. */
async function sendThroughRetries() {
	vi.useFakeTimers()
	const pending = send()
	await vi.advanceTimersByTimeAsync(CRM_RETRY_DELAY_MS)
	return pending
}

function expectNothingSubmittedReported() {
	const reported = JSON.stringify([reportError.mock.calls, vi.mocked(console.warn).mock.calls])
	for (const value of [KEY, ...SUBMITTED]) expect(reported).not.toContain(value)
}

beforeEach(() => {
	for (const key of Object.keys(env)) delete env[key]
	env.CRM_URL = 'https://crm.example.org'
	env.CRM_KEY = KEY
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

describe('sendContactToCrm', () => {
	it('sends the enquiry to PauseaiContactUs.send as it is', async () => {
		expect(await send()).toBe('ok')

		expect(fetchMock).toHaveBeenCalledOnce()
		expect(fetchMock.mock.calls[0][0]).toBe(
			'https://crm.example.org/civicrm/ajax/api4/PauseaiContactUs/send'
		)
		expect(sentParams()).toEqual(REQUEST)
		expect(reportError).not.toHaveBeenCalled()
	})

	it('answers a refusal without retrying, reported as a warning without submitted values', async () => {
		answerRow({ status: 'refused', reason: 'invalid_request' })

		expect(await send()).toBe('refused')
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(reportError).toHaveBeenCalledOnce()
		const [error, context, options] = reportError.mock.calls[0]
		expect((error as Error).message).toBe('Contact Us refused:invalid_request')
		expect(context).toEqual({
			check: 'contact-us',
			type: 'Partnerships',
			outcome: 'refused:invalid_request'
		})
		expect(options).toEqual({
			fingerprint: ['contact-us', 'refused:invalid_request'],
			level: 'warning'
		})
		expectNothingSubmittedReported()
	})

	it("retries the CRM's send_failed once, after about 1 s", async () => {
		fetchMock
			.mockImplementationOnce(() => reply({ values: [{ status: 'error', reason: 'send_failed' }] }))
			.mockImplementationOnce(() => reply({ values: [{ status: 'ok' }] }))
		vi.useFakeTimers()
		const pending = send()

		await vi.advanceTimersByTimeAsync(CRM_RETRY_DELAY_MS - 1)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		await vi.advanceTimersByTimeAsync(1)

		expect(await pending).toBe('ok')
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(sentParams(1)).toEqual(sentParams(0))
		expect(reportError).not.toHaveBeenCalled()
	})

	it('gives up after a failed retry and reports it once, without submitted values or the key', async () => {
		fetchMock.mockImplementation(networkError)

		expect(await sendThroughRetries()).toBe('failed')
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(reportError).toHaveBeenCalledOnce()
		const [error, context, options] = reportError.mock.calls[0]
		expect((error as Error).message).toBe('Contact Us error')
		expect(context).toEqual({
			check: 'contact-us',
			type: 'Partnerships',
			outcome: 'error',
			cause: 'network',
			errorName: 'TypeError',
			attempt: 2
		})
		expect(options).toEqual({ fingerprint: ['contact-us', 'error'], level: 'error' })
		expect(flushReports).toHaveBeenCalled()
		expect(console.warn).toHaveBeenCalled()
		expectNothingSubmittedReported()
	})

	it('reports send_failed by name when the retry fails too', async () => {
		answerRow({ status: 'error', reason: 'send_failed' })

		expect(await sendThroughRetries()).toBe('failed')
		expect(reportError.mock.calls[0][1]).toMatchObject({
			cause: 'crm_error',
			reason: 'send_failed',
			attempt: 2
		})
	})

	it("reports another error's reason code without retrying, and never free text", async () => {
		answerRow({ status: 'error', reason: 'mailer_down' })
		expect(await send()).toBe('failed')
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(reportError.mock.calls[0][1]).toMatchObject({
			cause: 'crm_error',
			reason: 'mailer_down',
			attempt: 1
		})

		reportError.mockClear()
		answerRow({ status: 'error', reason: 'Could not send to ada@example.org' })
		expect(await send()).toBe('failed')
		expect(reportError.mock.calls[0][1]).toMatchObject({ cause: 'crm_error', reason: 'unknown' })
		expectNothingSubmittedReported()
	})

	it('does not retry a 4xx or an answer of unknown shape', async () => {
		fetchMock.mockImplementation(() => reply({ error_message: 'nope' }, 403))
		expect(await send()).toBe('failed')
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(reportError.mock.calls[0][1]).toMatchObject({ cause: 'http', httpStatus: 403 })

		fetchMock.mockReset()
		reportError.mockClear()
		answerRow({ status: 'something new' })
		expect(await send()).toBe('failed')
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(reportError.mock.calls[0][1]).toMatchObject({ cause: 'http', httpStatus: 200 })
	})

	it('caps each attempt to what is left before the deadline, and skips a retry with too little', async () => {
		vi.useFakeTimers()
		const timeouts = vi.spyOn(AbortSignal, 'timeout')
		fetchMock.mockImplementation(networkError)

		const tooLittle = CRM_RETRY_DELAY_MS + CRM_MIN_ATTEMPT_MS - 500
		expect(await send({ deadline: Date.now() + tooLittle })).toBe('failed')
		expect(timeouts.mock.calls).toEqual([[tooLittle]])

		timeouts.mockClear()
		const enough = CRM_RETRY_DELAY_MS + CRM_MIN_ATTEMPT_MS + 500
		const pending = send({ deadline: Date.now() + enough })
		await vi.advanceTimersByTimeAsync(CRM_RETRY_DELAY_MS)
		expect(await pending).toBe('failed')
		expect(timeouts.mock.calls).toEqual([[enough], [CRM_MIN_ATTEMPT_MS + 500]])
	})

	it('sends nothing once the deadline has passed', async () => {
		expect(await send({ deadline: Date.now() - 1 })).toBe('failed')
		expect(fetchMock).not.toHaveBeenCalled()
		expect(reportError.mock.calls[0][1]).toMatchObject({ cause: 'deadline', attempt: 1 })
	})

	describe('without the CRM settings', () => {
		const inContext = (context: string, published = false) =>
			({
				context: { deploy: { context, published }, waitUntil: () => {} }
			}) as unknown as App.Platform

		beforeEach(() => {
			delete env.CRM_KEY
		})

		it.each([
			['a local server', 'localhost', undefined],
			['a deploy preview', 'deploy-preview-12--pauseai.netlify.app', inContext('deploy-preview')],
			['a branch deploy', 'some-branch--pauseai.netlify.app', inContext('branch-deploy')],
			['a deploy preview without a context', 'deploy-preview-12--pauseai.netlify.app', undefined]
		])('sends nothing and answers ok on %s', async (_, hostname, platform) => {
			expect(await send({ hostname, platform })).toBe('ok')
			expect(fetchMock).not.toHaveBeenCalled()
			expect(reportError).not.toHaveBeenCalled()
		})

		it.each([
			['the real site', 'pauseai.info', inContext('production')],
			['the netlify.app alias', 'pauseai.netlify.app', inContext('production')],
			[
				'an immutable deploy URL',
				'6745f0c1a2b3c4d5e6f70809--pauseai.netlify.app',
				inContext('production')
			],
			['the netlify.app alias without a context', 'pauseai.netlify.app', undefined],
			['a branch-like address without a context', 'some-branch--pauseai.netlify.app', undefined],
			['a published deploy preview', 'pauseai.info', inContext('deploy-preview', true)]
		])('fails and reports on %s', async (_, hostname, platform) => {
			const waitUntil = vi.fn<(promise: Promise<unknown>) => void>()
			if (platform) platform.context.waitUntil = waitUntil
			expect(await send({ hostname, platform })).toBe('failed')
			await waitUntil.mock.calls[0]?.[0]
			expect(fetchMock).not.toHaveBeenCalled()
			expect(reportError).toHaveBeenCalledOnce()
			expect(reportError.mock.calls[0][1]).toMatchObject({ cause: 'not_configured', attempt: 1 })
		})
	})

	it('reports after the response when the platform can wait for it', async () => {
		answerRow({ status: 'refused', reason: 'invalid_request' })
		const waitUntil = vi.fn<(promise: Promise<unknown>) => void>()

		const result = await send({
			platform: { context: { waitUntil } } as unknown as App.Platform
		})

		expect(result).toBe('refused')
		expect(waitUntil).toHaveBeenCalledOnce()
		await waitUntil.mock.calls[0][0]
		expect(reportError).toHaveBeenCalledOnce()
	})
})
