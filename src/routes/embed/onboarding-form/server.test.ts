import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const createRecord = vi.fn<(...args: unknown[]) => Promise<string | undefined>>()
const updateRecord = vi.fn<(...args: unknown[]) => Promise<'updated' | 'missing' | 'failed'>>()
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/airtable', () => ({ createRecord, updateRecord }))
vi.mock('$lib/server/turnstile-verify', () => ({
	checkNotSpam: () => Promise.resolve({ drop: false })
}))
vi.mock('$lib/server/substack', () => ({ subscribeToSubstackNewsletter: vi.fn() }))
vi.mock('$lib/server/sentry', () => ({ reportError }))

const { actions } = await import('./+page.server.js')
const { TOKEN_TTL_SECONDS } = await import('$lib/server/onboardingContinuation')

type Result = { status?: number; data?: Record<string, unknown> } & Record<string, unknown>

async function submit(fields: Record<string, string>): Promise<Result> {
	const body = new FormData()
	for (const [name, value] of Object.entries(fields)) body.set(name, value)
	const url = new URL('https://pauseai.info/embed/onboarding-form?/submit')
	const request = new Request(url, { method: 'POST', body })
	return (await actions.submit({ request, url, fetch } as never)) as Result
}

const signup = {
	full_name: 'Ada Lovelace',
	email: 'ada@example.org',
	country: 'United Kingdom',
	city: 'London',
	intent: 'None',
	agree_gdpr: 'on'
}

const update = (recordToken?: string) => ({
	email: 'ada@example.org',
	intent: 'Act now',
	record_id: 'recAda',
	...(recordToken === undefined ? {} : { record_token: recordToken })
})

describe('onboarding submit: continuation token', () => {
	beforeEach(() => {
		for (const key of Object.keys(env)) delete env[key]
		env.ONBOARDING_LIVE = 'true'
		env.ONBOARDING_CONTINUATION_SECRET = 'test-secret'
		createRecord.mockReset().mockResolvedValue('recAda')
		updateRecord.mockReset().mockResolvedValue('updated')
		reportError.mockClear()
		vi.spyOn(console, 'warn').mockImplementation(() => {})
	})
	afterEach(() => vi.useRealTimers())

	it('returns a token with a create, and a fresh one with an update that posts it', async () => {
		const created = await submit(signup)
		expect(created).toMatchObject({ success: true, recordId: 'recAda' })
		expect(created.recordToken).toMatch(/^v1\./)

		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		const updated = await submit(update(String(created.recordToken)))
		expect(updated).toMatchObject({ success: true, recordId: 'recAda' })
		expect(updated.recordToken).toMatch(/^v1\./)
		expect(updateRecord).toHaveBeenCalledOnce()
		expect(reportError).not.toHaveBeenCalled()
	})

	it('writes and reports an update without a valid token while not enforcing, issuing none', async () => {
		for (const token of [undefined, 'v1.9999999999.' + 'A'.repeat(43)]) {
			const updated = await submit(update(token))
			expect(updated).toMatchObject({ success: true, recordId: 'recAda' })
			expect(updated.recordToken).toBeUndefined()
		}
		expect(updateRecord).toHaveBeenCalledTimes(2)
		expect(reportError).toHaveBeenCalledTimes(2)
	})

	it('issues no token on an update when the secret is missing', async () => {
		delete env.ONBOARDING_CONTINUATION_SECRET
		vi.spyOn(console, 'error').mockImplementation(() => {})
		const updated = await submit(update())
		expect(updated).toMatchObject({ success: true, recordId: 'recAda' })
		expect(updated.recordToken).toBeUndefined()
	})

	it('refuses an update with a missing or forged token as gone when enforcing, creating nothing', async () => {
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		const created = await submit(signup)
		createRecord.mockClear()
		for (const token of [undefined, 'v1.9999999999.' + 'A'.repeat(43)]) {
			const refused = await submit(update(token))
			expect(refused.status).toBe(410)
		}
		const otherRow = await submit({ ...update(String(created.recordToken)), record_id: 'recGrace' })
		expect(otherRow.status).toBe(410)
		expect(updateRecord).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('refuses an expired token when enforcing', async () => {
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(new Date('2026-10-01T12:00:00Z'))
		const created = await submit(signup)
		vi.setSystemTime(Date.now() + TOKEN_TTL_SECONDS * 1000)
		const refused = await submit(update(String(created.recordToken)))
		expect(refused.status).toBe(410)
		expect(updateRecord).not.toHaveBeenCalled()
		expect(reportError.mock.calls[0][1]).toMatchObject({ verdict: 'expired' })
	})

	it('refuses a resumed signup with a bad token when enforcing, creating nothing', async () => {
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		const refused = await submit({ ...signup, ...update('garbage'), resumed: '1' })
		expect(refused.status).toBe(410)
		expect(updateRecord).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('issues and checks tokens in stub mode too', async () => {
		delete env.ONBOARDING_LIVE
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		vi.spyOn(console, 'error').mockImplementation(() => {})
		const created = await submit(signup)
		expect(created.recordId).toMatch(/^stub-/)
		expect(created.recordToken).toMatch(/^v1\./)
		const stubUpdate = {
			...update(String(created.recordToken)),
			record_id: String(created.recordId)
		}
		const updated = await submit(stubUpdate)
		expect(updated).toMatchObject({ success: true, recordId: created.recordId })
		expect(updated.recordToken).toMatch(/^v1\./)
		const refused = await submit({ ...stubUpdate, record_token: 'garbage' })
		expect(refused.status).toBe(410)
		expect(createRecord).not.toHaveBeenCalled()
		expect(updateRecord).not.toHaveBeenCalled()
	})
})
