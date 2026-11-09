import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const createRecord = vi.fn<(...args: unknown[]) => Promise<unknown>>()
const hasMatchingRecord = vi.fn<(...args: unknown[]) => Promise<boolean | 'failed'>>()
const verifyTurnstile =
	vi.fn<(...args: unknown[]) => Promise<{ ok: boolean; message?: string; unavailable?: true }>>()

vi.mock('$app/environment', () => ({ dev: false }))
vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/airtable', () => ({
	airtableFormulaString: (value: string) => `"${value}"`,
	createRecord,
	hasMatchingRecord
}))
vi.mock('$lib/server/turnstile-verify', () => ({ verifyTurnstile }))
const signInCrm = vi.fn<(...args: unknown[]) => Promise<'ok' | 'refused' | 'failed'>>()
vi.mock('$lib/server/statementCrm', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/server/statementCrm')>()),
	signInCrm
}))

const { actions } = await import('./+page.server.js')
const { resetRateLimits } = await import('$lib/server/rateLimit')

type Result = { status?: number; data?: Record<string, unknown> } & Record<string, unknown>

const VALID = {
	name: 'Ada Lovelace',
	email: 'ada@example.org',
	country: 'France',
	turnstile_token: 'a-token'
}
const LOCAL = 'http://localhost:37572'

async function submit(
	fields: Record<string, string>,
	address = '192.0.2.1',
	site = 'https://pauseai.info'
): Promise<Result> {
	// Urlencoded, as use:enhance posts a form with no file inputs.
	const body = new URLSearchParams(fields)
	const url = new URL(`${site}/statement/sign`)
	const request = new Request(url, { method: 'POST', body })
	return (await actions.default({
		request,
		url,
		getClientAddress: () => address
	} as never)) as Result
}

beforeEach(() => {
	env.STATEMENT_SIGNING_LIVE = 'true'
	env.ONBOARDING_LIVE = undefined
	env.STATEMENT_BACKEND = undefined
	signInCrm.mockReset().mockResolvedValue('ok')
	resetRateLimits()
	createRecord.mockReset().mockResolvedValue({ id: 'recAda', createdTime: '', fields: {} })
	hasMatchingRecord.mockReset().mockResolvedValue(false)
	verifyTurnstile.mockReset().mockResolvedValue({ ok: true })
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

	it('pretends success on a filled honeypot, without checking or writing', async () => {
		expect(await submit({ ...VALID, nickname: 'bot' })).toEqual({ success: true })
		expect(verifyTurnstile).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('catches the honeypot in a dry run too', async () => {
		env.STATEMENT_SIGNING_LIVE = undefined

		expect(await submit({ ...VALID, nickname: 'bot' }, undefined, LOCAL)).toEqual({ success: true })
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('checks the token against this site only, not chapter hostnames', async () => {
		await submit(VALID)

		expect(verifyTurnstile).toHaveBeenCalledExactlyOnceWith('a-token', ['pauseai.info'])
	})

	it('refuses a failed anti-spam check', async () => {
		verifyTurnstile.mockResolvedValue({ ok: false, message: 'The anti-spam check failed.' })
		const result = await submit(VALID)

		expect(result.status).toBe(403)
		expect(result.data?.message).toBe('The anti-spam check failed.')
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('shows a 503 when the anti-spam check is unavailable', async () => {
		verifyTurnstile.mockResolvedValue({ ok: false, unavailable: true, message: 'Unavailable.' })
		const result = await submit(VALID)

		expect(result.status).toBe(503)
		expect(result.data?.message).toBe('Unavailable.')
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('says thanks for a repeat signature, without writing', async () => {
		hasMatchingRecord.mockResolvedValue(true)

		expect(await submit(VALID)).toEqual({ success: true })
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('shows an error when Airtable fails, without echoing the input', async () => {
		createRecord.mockResolvedValue(undefined)
		const result = await submit(VALID)

		expect(result.status).toBe(502)
		expect(result.data?.message).toBe('Sorry, we could not save your signature. Please try again.')
		expect(JSON.stringify(result)).not.toContain(VALID.email)
	})

	it('shows an error on the real site when signing is off, saying nothing was saved', async () => {
		env.STATEMENT_SIGNING_LIVE = undefined
		env.ONBOARDING_LIVE = 'true'
		const result = await submit(VALID)

		expect(result.status).toBe(503)
		expect(result.data?.message).toContain('nothing was saved')
		expect(verifyTurnstile).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('says thanks in a dry run, without writing or needing a token', async () => {
		env.STATEMENT_SIGNING_LIVE = undefined

		expect(await submit(VALID, undefined, LOCAL)).toEqual({ success: true })
		expect(verifyTurnstile).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('limits repeated saves from one address', async () => {
		for (let save = 0; save < 30; save++) await submit(VALID)
		const result = await submit(VALID)

		expect(result.status).toBe(429)
		expect(createRecord).toHaveBeenCalledTimes(30)
	})

	it('does not count failed attempts against an address', async () => {
		for (let attempt = 0; attempt < 35; attempt++) await submit({ ...VALID, name: '' })

		expect(await submit(VALID)).toEqual({ success: true })
	})

	it('refuses an oversized post', async () => {
		const result = await submit({ ...VALID, bio: 'x'.repeat(33 * 1024) })

		expect(result.status).toBe(413)
		expect(createRecord).not.toHaveBeenCalled()
	})
})

describe('/statement/sign action: STATEMENT_BACKEND=civicrm', () => {
	beforeEach(() => {
		env.STATEMENT_BACKEND = 'civicrm'
	})

	it('thanks the signer once CiviCRM has the signature, in English', async () => {
		expect(await submit(VALID)).toEqual({ success: true })
		expect(signInCrm.mock.calls[0][0]).toMatchObject({ country: 'France', language: 'en' })
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('shows an error, never the thanks, when CiviCRM could not save it', async () => {
		signInCrm.mockResolvedValue('failed')
		const result = await submit(VALID)

		expect(result.status).toBe(502)
		expect(result.data?.message).toBe('Sorry, we could not save your signature. Please try again.')
	})

	it('asks for a check without highlighting a field when CiviCRM refuses', async () => {
		signInCrm.mockResolvedValue('refused')
		const result = await submit(VALID)

		expect(result.status).toBe(400)
		expect(result.data).toEqual({
			message: 'Please check what you entered and try again.',
			fields: {}
		})
	})
})
