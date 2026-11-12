// The privacy guarantees, against the real Airtable helpers with only the SDK mocked: what
// Airtable answers with on a failure can quote submitted values, and none of it may reach a
// log, an error report or a response.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const create = vi.fn<(...args: unknown[]) => Promise<unknown>>()
const firstPage = vi.fn<() => Promise<unknown[]>>()
const select = vi.fn<(options: Record<string, unknown>) => { firstPage: typeof firstPage }>()
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()

vi.mock('$app/environment', () => ({ dev: false }))
vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('#lib/env.server', () => ({ isDev: () => false, getDevContext: () => 'test' }))
vi.mock('#lib/server/sentry.ts', () => ({ reportError }))
vi.mock('#lib/server/turnstile-verify.ts', () => ({
	verifyTurnstile: () => Promise.resolve({ ok: true })
}))
vi.mock('airtable', () => ({
	default: class {
		base() {
			return () => ({ create, select })
		}
	}
}))

const { airtableFormulaString, createRecord, hasMatchingRecord } = await import('#lib/airtable.ts')
const { resetRateLimits } = await import('#lib/server/rateLimit.ts')
const { signStatement } = await import('./statement')

const EMAIL = 'ada.secret@example.org'
const NAME = 'Ada Secretname'
const INPUT = { name: NAME, email: EMAIL, country: 'Spain', bio: 'Secret bio', private: false }
const CONTEXT = {
	hostname: 'pauseai.info',
	allowedHostnames: ['pauseai.info'],
	turnstileToken: 'a-token',
	getClientAddress: () => '192.0.2.1'
}

// As the SDK throws: an AirtableError with a message quoting what was sent.
const airtableError = (fields: Record<string, unknown> = {}) =>
	Object.assign(new Error(`Could not save ${EMAIL} for ${NAME}`), {
		error: 'INVALID_VALUE_FOR_COLUMN',
		message: `Could not save ${EMAIL} for ${NAME}`,
		statusCode: 422,
		...fields
	})

const everythingLogged = () =>
	[console.log, console.warn, console.error]
		.flatMap((spy) => vi.mocked(spy).mock.calls)
		.flat()
		.concat(reportError.mock.calls.flat())
		.map((value) => (value instanceof Error ? `${value.message} ${value.stack}` : String(value)))
		.join('\n')

const reportedMessage = () => (reportError.mock.calls[0][0] as Error).message

beforeEach(() => {
	env.STATEMENT_SIGNING_LIVE = 'true'
	env.AIRTABLE_WRITE_API_KEY = 'a-key'
	resetRateLimits()
	create.mockReset().mockResolvedValue([{ id: 'rec', fields: {}, _rawJson: { createdTime: '' } }])
	firstPage.mockReset().mockResolvedValue([])
	select.mockReset().mockReturnValue({ firstPage })
	reportError.mockReset().mockResolvedValue()
	vi.spyOn(console, 'log').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signing keeps personal data out of logs and reports', () => {
	it('when the write fails', async () => {
		create.mockRejectedValue(airtableError())

		expect(await signStatement(INPUT, CONTEXT)).toEqual({ status: 'failed' })
		expect(reportError).toHaveBeenCalledOnce()
		expect(reportedMessage()).toBe('Airtable write failed: INVALID_VALUE_FOR_COLUMN (status 422)')
		expect(everythingLogged()).not.toContain(EMAIL)
		expect(everythingLogged()).not.toContain(NAME)
	})

	it('when the lookup fails, which has the address in its formula', async () => {
		firstPage.mockRejectedValue(airtableError({ error: 'INVALID_FILTER_BY_FORMULA' }))

		expect(await signStatement(INPUT, CONTEXT)).toEqual({ status: 'failed' })
		expect(create).not.toHaveBeenCalled()
		expect(reportedMessage()).toBe('Airtable read failed: INVALID_FILTER_BY_FORMULA (status 422)')
		expect(everythingLogged()).not.toContain(EMAIL)
	})

	it('when signing succeeds', async () => {
		expect(await signStatement(INPUT, CONTEXT)).toEqual({ status: 'accepted' })
		expect(everythingLogged()).not.toContain(EMAIL)
		expect(everythingLogged()).not.toContain(NAME)
	})

	it('asks Airtable for no personal field on a lookup', async () => {
		await signStatement(INPUT, CONTEXT)

		const options = select.mock.calls[0][0]
		expect(options.fields).toEqual(['email_verified'])
		expect(options.maxRecords).toBe(1)
		expect(options.filterByFormula).toContain(`"${EMAIL}"`)
	})

	it('writes nothing for a repeat, verified or not', async () => {
		firstPage.mockResolvedValue([{ id: 'recEarlier', fields: {} }])

		expect(await signStatement(INPUT, CONTEXT)).toEqual({ status: 'accepted' })
		expect(create).not.toHaveBeenCalled()
	})
})

describe('redacted Airtable errors', () => {
	const failWrite = async (caught: unknown) => {
		create.mockRejectedValue(caught)
		await createRecord('app', 'tbl', { email: EMAIL }, { redactErrors: true })
		return reportedMessage()
	}

	it('keeps only a code and a status', async () => {
		expect(await failWrite(airtableError())).toBe(
			'Airtable write failed: INVALID_VALUE_FOR_COLUMN (status 422)'
		)
	})

	it.each([
		['an error code quoting a value', { error: `BAD ${EMAIL}`, statusCode: 422 }, 'UNKNOWN', '422'],
		['a lowercase error code', { error: 'not_a_code', statusCode: 422 }, 'UNKNOWN', '422'],
		['a code that is not a string', { error: { email: EMAIL }, statusCode: 500 }, 'UNKNOWN', '500'],
		['a status that is not a number', { error: 'X', statusCode: EMAIL }, 'X', 'unknown'],
		['neither', {}, 'UNKNOWN', 'unknown']
	])('drops %s', async (_label, fields, code, status) => {
		const message = await failWrite(Object.assign(new Error(EMAIL), fields))

		expect(message).toBe(`Airtable write failed: ${code} (status ${status})`)
		expect(everythingLogged()).not.toContain(EMAIL)
	})

	it.each([[null], [undefined], [EMAIL], [42]])('copes with %j being thrown', async (thrown) => {
		expect(await failWrite(thrown)).toBe('Airtable write failed: UNKNOWN (status unknown)')
		expect(everythingLogged()).not.toContain(EMAIL)
	})

	it('leaves other callers with the full error, for their own debugging', async () => {
		const caught = airtableError()
		create.mockRejectedValue(caught)
		await createRecord('app', 'tbl', { name: 'x' })

		expect(reportError.mock.calls[0][0]).toBe(caught)
	})

	it('always redacts a lookup, which has no option to do otherwise', async () => {
		firstPage.mockRejectedValue(airtableError())

		expect(await hasMatchingRecord('app', 'tbl', `{email} = "${EMAIL}"`, 'field')).toBe('failed')
		expect(reportedMessage()).toBe('Airtable read failed: INVALID_VALUE_FOR_COLUMN (status 422)')
		expect(everythingLogged()).not.toContain(EMAIL)
	})
})

describe('hasMatchingRecord', () => {
	it('answers whether a row matched', async () => {
		expect(await hasMatchingRecord('app', 'tbl', 'TRUE()', 'field')).toBe(false)

		firstPage.mockResolvedValue([{ id: 'rec', fields: {} }])
		expect(await hasMatchingRecord('app', 'tbl', 'TRUE()', 'field')).toBe(true)
	})

	it('fails without a key, rather than saying there is no match', async () => {
		env.AIRTABLE_WRITE_API_KEY = undefined
		env.AIRTABLE_API_KEY = undefined

		expect(await hasMatchingRecord('app', 'tbl', 'TRUE()', 'field')).toBe('failed')
		expect(select).not.toHaveBeenCalled()
	})
})

describe('airtableFormulaString', () => {
	it.each([
		['ada@example.org', '"ada@example.org"'],
		['a"b', '"a\\"b"'],
		['a\\b', '"a\\\\b"'],
		// A backslash cannot be used to undo the escaping of the quote after it.
		['a\\"b', '"a\\\\\\"b"'],
		["o'brien", `"o'brien"`],
		['a\nb\rc\td', '"a\\nb\\rc\\td"'],
		['a\u0000b\u0085c', '"abc"'],
		['", TRUE(), "', '"\\", TRUE(), \\""'],
		['{email}', '"{email}"'],
		['', '""']
	])('escapes %j', (value, expected) => {
		expect(airtableFormulaString(value)).toBe(expected)
	})

	it('cannot close its own string, whatever it is given', () => {
		for (const value of ['"', '\\"', '\\\\"', '\\\\\\"', 'x"&&"', '\\']) {
			const inner = airtableFormulaString(value).slice(1, -1)
			// Walk it as Airtable does: a backslash takes the next character with it.
			for (let index = 0; index < inner.length; index++) {
				if (inner[index] === '\\') index += 1
				else expect(inner[index]).not.toBe('"')
			}
			expect(inner.endsWith('\\') && !inner.endsWith('\\\\')).toBe(false)
		}
	})
})
