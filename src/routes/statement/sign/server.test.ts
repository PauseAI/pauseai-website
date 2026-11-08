import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const createRecord = vi.fn<(...args: unknown[]) => Promise<unknown>>()
const checkNotSpam = vi.fn<(...args: unknown[]) => Promise<{ drop: boolean; message?: string }>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/airtable', () => ({ createRecord }))
vi.mock('$lib/server/turnstile-verify', () => ({ checkNotSpam }))

const { actions } = await import('./+page.server.js')
const { resetRateLimits } = await import('$lib/server/rateLimit')

type Result = { status?: number; data?: Record<string, unknown> } & Record<string, unknown>

const VALID = { name: 'Ada Lovelace', email: 'ada@example.org', country: 'France' }

async function submit(fields: Record<string, string>, address = '192.0.2.1'): Promise<Result> {
	// Urlencoded, as use:enhance posts a form with no file inputs.
	const body = new URLSearchParams(fields)
	const url = new URL('https://pauseai.info/statement/sign')
	const request = new Request(url, { method: 'POST', body })
	return (await actions.default({
		request,
		url,
		getClientAddress: () => address
	} as never)) as Result
}

beforeEach(() => {
	env.ONBOARDING_LIVE = 'true'
	resetRateLimits()
	createRecord.mockReset().mockResolvedValue({ id: 'recAda', createdTime: '', fields: {} })
	checkNotSpam.mockReset().mockResolvedValue({ drop: false })
	vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('statement form action', () => {
	it('saves the right fields to the Signatories table, leaving email_verified unset', async () => {
		const result = await submit({ ...VALID, bio: ' Line one\r\nLine two ' })

		expect(result).toEqual({ success: true })
		const [base, table, fields] = createRecord.mock.calls[0]
		expect(base).toBe('appWPTGqZmUcs3NWu')
		expect(table).toBe('tbl2emfOWNWoVz1kW')
		expect(fields).toEqual({
			name: 'Ada Lovelace',
			email: 'ada@example.org',
			country: 'France',
			bio: 'Line one\nLine two',
			private: false
		})
	})

	it('saves an anonymous signature', async () => {
		expect(await submit({ ...VALID, private: 'on' })).toEqual({ success: true })

		expect(createRecord.mock.calls[0][2]).toMatchObject({ name: 'Ada Lovelace', private: true })
	})

	it.each([
		['name', { name: '' }, 'Please enter your full name.'],
		['email', { email: 'nope' }, 'Please enter a valid email address.'],
		['country', { country: 'Atlantis' }, 'Please select a country from the list.'],
		['bio', { bio: 'x'.repeat(2001) }, 'Please keep this under 2000 characters.']
	])('refuses an invalid %s with a message for that field', async (field, change, message) => {
		const result = await submit({ ...VALID, ...change })

		expect(result.status).toBe(400)
		expect(result.data?.fields).toEqual({ [field]: message })
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('pretends success on a filled honeypot, without writing', async () => {
		checkNotSpam.mockResolvedValue({ drop: true })

		expect(await submit({ ...VALID, nickname: 'bot' })).toEqual({ success: true })
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('catches the honeypot outside production too, where Turnstile does not run', async () => {
		env.ONBOARDING_LIVE = undefined

		expect(await submit({ ...VALID, nickname: 'bot' })).toEqual({ success: true })
		expect(checkNotSpam).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('refuses a failed anti-spam check', async () => {
		checkNotSpam.mockResolvedValue({ drop: false, message: 'The anti-spam check failed.' })
		const result = await submit(VALID)

		expect(result.status).toBe(403)
		expect(result.data?.message).toBe('The anti-spam check failed.')
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('shows an error when Airtable fails, without echoing the input', async () => {
		createRecord.mockResolvedValue(undefined)
		const result = await submit(VALID)

		expect(result.status).toBe(502)
		expect(result.data?.message).toBe('Sorry, we could not save your signature. Please try again.')
		expect(JSON.stringify(result)).not.toContain(VALID.email)
	})

	it('does not write outside production, or need a Turnstile token', async () => {
		env.ONBOARDING_LIVE = undefined

		expect(await submit(VALID)).toEqual({ success: true })
		expect(checkNotSpam).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('limits repeated attempts from one address', async () => {
		for (let attempt = 0; attempt < 10; attempt++) await submit(VALID)
		const result = await submit(VALID)

		expect(result.status).toBe(429)
		expect(createRecord).toHaveBeenCalledTimes(10)
	})

	it('refuses an oversized post', async () => {
		const result = await submit({ ...VALID, bio: 'x'.repeat(33 * 1024) })

		expect(result.status).toBe(413)
		expect(createRecord).not.toHaveBeenCalled()
	})
})
