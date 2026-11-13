import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const reportError =
	vi.fn<(error: unknown, context?: Record<string, unknown>, options?: unknown) => Promise<void>>()
const flushReports = vi.fn<() => Promise<void>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError, flushReports }))

const ACTION_DEADLINE_MS = 25_000
const { isSignupKey, memberBackend, mintSignupKey, submitSignup, verifySignupInCrm } =
	await import('./memberCrm.js')

const KEY = 'memAbCdEfGhIjKlMnOpQrStUv'
const RECORD = {
	id: KEY,
	createdTime: '2026-11-13T12:00:00.000Z',
	fields: { Email: 'ada@example.org', 'Full name': 'Ada Lovelace', Intent: 'None' }
}
const TOKEN = 'v1.1800000000.' + 'A'.repeat(43)

const fetchMock = vi.fn<typeof fetch>()
const respond = (body: unknown, status = 200) =>
	Promise.resolve(new Response(JSON.stringify(body), { status }))
const row = (r: Record<string, unknown>) => respond({ values: [r] })
const sentParams = (call: number): unknown =>
	JSON.parse((fetchMock.mock.calls[call][1]?.body as URLSearchParams).get('params')!)

beforeEach(() => {
	for (const key of Object.keys(env)) delete env[key]
	env.CRM_INTAKE_URL = 'https://crm.example.org'
	env.CRM_INTAKE_KEY = 'test-key-not-real'
	fetchMock.mockReset()
	vi.stubGlobal('fetch', fetchMock)
	reportError.mockReset().mockResolvedValue()
	flushReports.mockReset().mockResolvedValue()
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	vi.useFakeTimers()
})
afterEach(() => {
	vi.useRealTimers()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

/** Runs submitSignup with a deadline from now, letting its waits pass. */
async function submit(deadlineMs = ACTION_DEADLINE_MS) {
	const pending = submitSignup(RECORD, TOKEN, Date.now() + deadlineMs)
	await vi.runAllTimersAsync()
	return pending
}

// Fake timers do not drive AbortSignal.timeout, so the attempt timeout runs on a fake timer too.
function fakeAttemptTimeouts() {
	return vi.spyOn(AbortSignal, 'timeout').mockImplementation((ms) => {
		const controller = new AbortController()
		setTimeout(() => controller.abort(new DOMException('timed out', 'TimeoutError')), ms)
		return controller.signal
	})
}

/** A CRM down until `downForMs` from now whose calls hang until their timeout, then fine. */
function hangUntil(downForMs: number) {
	const start = Date.now()
	const starts: number[] = []
	fetchMock.mockImplementation((_url, init) => {
		starts.push(Date.now() - start)
		if (Date.now() - start >= downForMs) return row({ status: 'ok', contact_id: 7 })
		return new Promise((_resolve, reject) =>
			init!.signal!.addEventListener('abort', () => reject(init!.signal!.reason as Error))
		)
	})
	return starts
}

describe('signup keys', () => {
	it('mints mem and 22 base62 characters, a different one each time', () => {
		const keys = new Set(Array.from({ length: 200 }, mintSignupKey))
		expect(keys.size).toBe(200)
		for (const key of keys) expect(isSignupKey(key)).toBe(true)
	})

	it('tells a signup key from a record id and from anything near it', () => {
		expect(isSignupKey(KEY)).toBe(true)
		for (const other of [
			'recAbcdefghijklmn',
			KEY.slice(0, -1),
			KEY + 'x',
			'mem_' + KEY.slice(4),
			'',
			7
		]) {
			expect(isSignupKey(other)).toBe(false)
		}
	})

	it('writes new signups to CiviCRM only when MEMBER_BACKEND is exactly civicrm', () => {
		expect(memberBackend()).toBe('airtable')
		env.MEMBER_BACKEND = 'CiviCRM'
		expect(memberBackend()).toBe('airtable')
		env.MEMBER_BACKEND = 'civicrm'
		expect(memberBackend()).toBe('civicrm')
	})
})

describe('submitSignup', () => {
	it('sends the record and token once on ok, and reports nothing', async () => {
		fetchMock.mockImplementation(() => row({ status: 'ok', contact_id: 7 }))
		expect(await submit()).toBe('saved')
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(fetchMock.mock.calls[0][0]).toBe(
			'https://crm.example.org/civicrm/ajax/api4/PauseaiMemberIntake/submit'
		)
		expect(sentParams(0)).toEqual({ record: RECORD, token: TOKEN })
		expect(reportError).not.toHaveBeenCalled()
	})

	it('retries a 5xx, a network failure and a busy key with the same key, token and record', async () => {
		fetchMock
			.mockImplementationOnce(() => respond({}, 503))
			.mockImplementationOnce(() => Promise.reject(new TypeError('fetch failed')))
			.mockImplementationOnce(() => row({ status: 'error', reason: 'locked' }))
			.mockImplementation(() => row({ status: 'ok', contact_id: 7 }))
		expect(await submit()).toBe('saved')
		expect(fetchMock).toHaveBeenCalledTimes(4)
		for (let call = 0; call < 4; call++)
			expect(sentParams(call)).toEqual({ record: RECORD, token: TOKEN })
	})

	it('outlasts an outage of immediate failures as long as a deploy swap (about 14 s)', async () => {
		const start = Date.now()
		fetchMock.mockImplementation(() =>
			Date.now() - start < 14_000 ? respond({}, 502) : row({ status: 'ok', contact_id: 7 })
		)
		expect(await submit()).toBe('saved')
	})

	it('outlasts an outage as long as a deploy swap whose calls hang until they time out', async () => {
		fakeAttemptTimeouts()
		const starts = hangUntil(14_000)
		expect(await submit()).toBe('saved')
		expect(starts).toEqual([0, 7_500, 15_000])
		expect(reportError).not.toHaveBeenCalled()
	})

	it('still fits a retry after a hanging outage when Turnstile and overhead took over 5 s', async () => {
		fakeAttemptTimeouts()
		hangUntil(14_000)
		expect(await submit(ACTION_DEADLINE_MS - 5_100)).toBe('saved')
	})

	it('gives up within the deadline when the CRM hangs, and reports it as an error with the key', async () => {
		const timeouts = fakeAttemptTimeouts()
		const starts = hangUntil(Infinity)
		const start = Date.now()
		expect(await submit()).toBe('not_saved')
		expect(Date.now() - start).toBeLessThanOrEqual(ACTION_DEADLINE_MS)
		expect(starts).toEqual([0, 7_500, 15_000])
		// The last attempt, after which no retry could fit, waits out what is left.
		expect(timeouts.mock.calls).toEqual([[7_500], [7_500], [10_000]])
		const [, context, options] = reportError.mock.calls[0]
		expect(context).toMatchObject({
			check: 'crm-signup',
			recordId: KEY,
			outcome: 'error',
			cause: 'timeout'
		})
		expect(options).toMatchObject({ level: 'error', fingerprint: ['crm-signup', 'error'] })
		expect(JSON.stringify(reportError.mock.calls)).not.toContain('ada@example.org')
	})

	it('waits out a slow CRM on the last attempt that fits instead of cutting it off', async () => {
		fakeAttemptTimeouts()
		const start = Date.now()
		const starts: number[] = []
		fetchMock.mockImplementation((_url, init) => {
			starts.push(Date.now() - start)
			return new Promise((resolve, reject) => {
				const answer = setTimeout(() => resolve(row({ status: 'ok', contact_id: 7 })), 9_000)
				init!.signal!.addEventListener('abort', () => {
					clearTimeout(answer)
					reject(init!.signal!.reason as Error)
				})
			})
		})
		expect(await submit()).toBe('saved')
		expect(starts).toEqual([0, 7_500, 15_000])
	})

	it('retries a busy key at once, since CiviCRM already waited for its lock', async () => {
		const start = Date.now()
		const starts: number[] = []
		fetchMock.mockImplementation(() => {
			starts.push(Date.now() - start)
			if (starts.length <= 3) return respond({}, 503)
			if (starts.length > 4) return row({ status: 'ok', contact_id: 7 })
			return new Promise((resolve) => setTimeout(resolve, 5_500)).then(() =>
				row({ status: 'error', reason: 'locked' })
			)
		})
		expect(await submit()).toBe('saved')
		// The busy answer lands at 12.5 s, before the 15 s slot.
		expect(starts).toEqual([0, 1_000, 3_000, 7_000, 12_500])
	})

	it('retries a plain 500 once, as CiviCRM answers a permanent fault with it too', async () => {
		fetchMock.mockImplementation(() => respond({}, 500))
		expect(await submit()).toBe('not_saved')
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(reportError.mock.calls[0][1]).toMatchObject({ cause: 'http', httpStatus: 500 })
	})

	it("retries Cloudflare's 52x on the whole schedule, and no other 5xx", async () => {
		fetchMock.mockImplementation(() => respond({}, 522))
		await submit()
		expect(fetchMock).toHaveBeenCalledTimes(5)
		for (const status of [501, 505]) {
			fetchMock.mockReset().mockImplementation(() => respond({}, status))
			await submit()
			expect(fetchMock).toHaveBeenCalledOnce()
		}
	})

	it('maps refusals to what the form does', async () => {
		const cases: [string, string][] = [
			['chapter_answer_missing', 'chapter_answer_missing'],
			['token_expired', 'not_saved'],
			['trashed', 'row_gone'],
			['erased', 'row_gone'],
			['invalid_record', 'not_saved']
		]
		for (const [reason, result] of cases) {
			fetchMock.mockImplementation(() => row({ status: 'refused', reason }))
			expect(await submit()).toBe(result)
		}
	})

	it('reports an unknown refusal reason as unknown, never as sent', async () => {
		fetchMock.mockImplementation(() => row({ status: 'refused', reason: 'ada@example.org' }))
		expect(await submit()).toBe('not_saved')
		expect(JSON.stringify(reportError.mock.calls)).not.toContain('ada@example.org')
		expect(reportError.mock.calls[0][1]).toMatchObject({ outcome: 'refused:unknown' })
	})

	it('reports after the response when there is a platform', async () => {
		fetchMock.mockImplementation(() => row({ status: 'refused', reason: 'trashed' }))
		const waitUntil = vi.fn()
		const pending = submitSignup(RECORD, TOKEN, Date.now() + ACTION_DEADLINE_MS, {
			context: { waitUntil }
		} as unknown as App.Platform)
		await vi.runAllTimersAsync()
		expect(await pending).toBe('row_gone')
		expect(waitUntil).toHaveBeenCalledOnce()
	})

	it('never starts a retry it cannot finish', async () => {
		fetchMock.mockImplementation(() => respond({}, 503))
		await submit(4_900)
		// The first attempt at 0 s; a retry would start at 1 s with less than 4 s left.
		expect(fetchMock).toHaveBeenCalledOnce()
	})

	it('does not retry a refusal, and reports one the form can act on as a warning', async () => {
		for (const reason of ['trashed', 'chapter_answer_missing']) {
			fetchMock.mockReset().mockImplementation(() => row({ status: 'refused', reason }))
			reportError.mockClear()
			await submit()
			expect(fetchMock).toHaveBeenCalledOnce()
			expect(reportError.mock.calls[0][2]).toMatchObject({ level: 'warning' })
		}
	})

	it('reports a refusal that leaves the signup unsaved as an error, token refusals included', async () => {
		// The token is one this server minted or checked: a refusal means the secrets disagree.
		for (const reason of [
			'token_invalid',
			'token_unverifiable',
			'token_required',
			'invalid_record',
			'ada@example.org'
		]) {
			fetchMock.mockReset().mockImplementation(() => row({ status: 'refused', reason }))
			reportError.mockClear()
			expect(await submit()).toBe('not_saved')
			expect(fetchMock).toHaveBeenCalledOnce()
			expect(reportError.mock.calls[0][2]).toMatchObject({ level: 'error' })
		}
	})

	it('counts error:memberships as written, and reports it as an error with the key for the repair', async () => {
		fetchMock.mockImplementation(() =>
			row({ status: 'error', reason: 'memberships', contact_id: 7 })
		)
		expect(await submit()).toBe('saved')
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(reportError.mock.calls[0][1]).toMatchObject({
			recordId: KEY,
			outcome: 'error:memberships'
		})
		expect(reportError.mock.calls[0][2]).toMatchObject({ level: 'error' })
	})

	it('does not retry a 4xx or missing configuration, which a retry would repeat', async () => {
		fetchMock.mockImplementation(() => respond({}, 400))
		expect(await submit()).toBe('not_saved')
		expect(fetchMock).toHaveBeenCalledOnce()
		delete env.CRM_INTAKE_KEY
		fetchMock.mockClear()
		expect(await submit()).toBe('not_saved')
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('verifySignupInCrm', () => {
	it("passes CiviCRM's answer on, and a failure as failed", async () => {
		vi.useRealTimers()
		fetchMock.mockImplementation(() => row({ status: 'expired' }))
		expect(await verifySignupInCrm(KEY, TOKEN)).toBe('expired')
		expect(sentParams(0)).toEqual({ key: KEY, token: TOKEN })
		fetchMock.mockImplementation(() => respond({}, 500))
		expect(await verifySignupInCrm(KEY, TOKEN)).toBe('failed')
		fetchMock.mockImplementation(() => row({ status: 'surprise' }))
		expect(await verifySignupInCrm(KEY, TOKEN)).toBe('failed')
	})
})
