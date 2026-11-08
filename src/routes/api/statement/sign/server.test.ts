import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const createRecord = vi.fn<(...args: unknown[]) => Promise<unknown>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/airtable', () => ({ createRecord }))

const { OPTIONS, POST } = await import('./+server.js')
const { resetRateLimits } = await import('$lib/server/rateLimit')

const SITE = 'https://pauseai.info'
const CHAPTER = 'https://pauseai.es'
const SECRET_EMAIL = 'ada@example.org'
const VALID = {
	name: 'Ada Lovelace',
	email: SECRET_EMAIL,
	country: 'Spain',
	bio: 'I care about this.',
	private: false,
	honeypot: ''
}

type PostOptions = {
	origin?: string | null
	contentType?: string
	address?: string
	rawBody?: string
}

function post(body: unknown, options: PostOptions = {}) {
	const { origin = CHAPTER, contentType = 'application/json', address = '192.0.2.1' } = options
	const url = new URL(`${SITE}/api/statement/sign`)
	const request = new Request(url, {
		method: 'POST',
		headers: { 'content-type': contentType, ...(origin ? { origin } : {}) },
		body: options.rawBody ?? JSON.stringify(body)
	})
	return POST({ request, url, getClientAddress: () => address } as never)
}

function preflight(origin: string | null) {
	const url = new URL(`${SITE}/api/statement/sign`)
	const request = new Request(url, { method: 'OPTIONS', headers: origin ? { origin } : {} })
	return OPTIONS({ request, url } as never)
}

const logged = () =>
	[console.log, console.warn, console.error]
		.flatMap((spy) => vi.mocked(spy).mock.calls)
		.map((call) => JSON.stringify(call))
		.join('\n')

beforeEach(() => {
	env.ONBOARDING_LIVE = 'true'
	resetRateLimits()
	createRecord.mockReset().mockResolvedValue({ id: 'recAda', createdTime: '', fields: {} })
	vi.spyOn(console, 'log').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('POST /api/statement/sign: saving', () => {
	it('saves the contract fields to the Signatories table, leaving email_verified unset', async () => {
		const response = await post(VALID)

		expect(response.status).toBe(202)
		expect(await response.json()).toEqual({ ok: true, status: 'pending_verification' })
		expect(createRecord).toHaveBeenCalledOnce()
		const [base, table, fields] = createRecord.mock.calls[0]
		expect(base).toBe('appWPTGqZmUcs3NWu')
		expect(table).toBe('tbl2emfOWNWoVz1kW')
		expect(fields).toEqual({
			name: 'Ada Lovelace',
			email: SECRET_EMAIL,
			country: 'Spain',
			bio: 'I care about this.',
			private: false
		})
	})

	it('saves an anonymous signature with private ticked and the name kept', async () => {
		await post({ ...VALID, private: true })

		expect(createRecord.mock.calls[0][2]).toMatchObject({ name: 'Ada Lovelace', private: true })
	})

	it('accepts a missing bio and does not write the field', async () => {
		const response = await post({ ...VALID, bio: undefined })

		expect(response.status).toBe(202)
		expect(createRecord.mock.calls[0][2]).not.toHaveProperty('bio')
	})

	it('ignores fields outside the contract', async () => {
		await post({ ...VALID, email_verified: true, duplicate: true, locale: 'es', source: 'x' })

		expect(Object.keys(createRecord.mock.calls[0][2] as object).sort()).toEqual([
			'bio',
			'country',
			'email',
			'name',
			'private'
		])
	})

	it('does not write outside production', async () => {
		env.ONBOARDING_LIVE = undefined
		const response = await post(VALID)

		expect(response.status).toBe(202)
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('answers the same for a repeat signature, without looking up earlier ones', async () => {
		const first = await (await post(VALID)).json()
		const second = await (await post(VALID)).json()

		expect(second).toEqual(first)
	})
})

describe('POST /api/statement/sign: refusals', () => {
	it.each([
		['missing name', { name: '  ' }, { name: 'required' }],
		['overlong name', { name: 'x'.repeat(201) }, { name: 'too_long' }],
		['missing email', { email: '' }, { email: 'required' }],
		['malformed email', { email: 'not-an-email' }, { email: 'invalid' }],
		['unknown country', { country: 'Atlantis' }, { country: 'invalid' }],
		['overlong bio', { bio: 'x'.repeat(2001) }, { bio: 'too_long' }],
		['non-string bio', { bio: 42 }, { bio: 'invalid' }],
		['stringly private', { private: 'true' }, { private: 'invalid' }],
		['missing private', { private: undefined }, { private: 'required' }]
	])('refuses %s, naming the field and not writing', async (_label, change, fields) => {
		const response = await post({ ...VALID, ...change })

		expect(response.status).toBe(400)
		expect(await response.json()).toEqual({ ok: false, error: 'validation_failed', fields })
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('pretends success on a filled honeypot, without writing', async () => {
		const response = await post({ ...VALID, honeypot: 'gotcha' })

		expect(response.status).toBe(202)
		expect(await response.json()).toEqual({ ok: true, status: 'pending_verification' })
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('refuses a body that is not JSON', async () => {
		const response = await post(null, { rawBody: '{nope' })

		expect(response.status).toBe(400)
		expect(await response.json()).toEqual({ ok: false, error: 'invalid_json' })
	})

	it('refuses JSON that is not an object', async () => {
		expect((await post([VALID])).status).toBe(400)
	})

	it('refuses other content types', async () => {
		const response = await post(VALID, { contentType: 'text/plain' })

		expect(response.status).toBe(415)
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('refuses an oversized body', async () => {
		const response = await post({ ...VALID, padding: 'x'.repeat(33 * 1024) })

		expect(response.status).toBe(413)
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('limits repeated attempts from one address, and not from another', async () => {
		for (let attempt = 0; attempt < 10; attempt++) {
			expect((await post(VALID)).status).toBe(202)
		}
		const limited = await post(VALID)

		expect(limited.status).toBe(429)
		expect(await limited.json()).toEqual({ ok: false, error: 'rate_limited' })
		expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0)
		expect(limited.headers.get('access-control-allow-origin')).toBe(CHAPTER)
		expect(createRecord).toHaveBeenCalledTimes(10)

		expect((await post(VALID, { address: '192.0.2.2' })).status).toBe(202)
	})

	it('reports a failed save without echoing what was sent', async () => {
		createRecord.mockResolvedValue(undefined)
		const response = await post(VALID)
		const text = await response.text()

		expect(response.status).toBe(502)
		expect(JSON.parse(text)).toEqual({ ok: false, error: 'save_failed' })
		expect(text).not.toContain(SECRET_EMAIL)
		expect(text).not.toContain(VALID.name)
	})

	it('keeps submitted values out of the logs', async () => {
		await post(VALID)
		createRecord.mockResolvedValue(undefined)
		await post(VALID)
		await post({ ...VALID, country: 'Atlantis' })

		expect(logged()).not.toContain(SECRET_EMAIL)
		expect(logged()).not.toContain(VALID.name)
	})

	it('never mentions the storage in a response', async () => {
		createRecord.mockResolvedValue(undefined)
		const responses = await Promise.all([post(VALID), post({}), post({ ...VALID, honeypot: 'x' })])
		for (const response of responses) {
			expect((await response.text()).toLowerCase()).not.toContain('airtable')
		}
	})
})

describe('/api/statement/sign: CORS', () => {
	it('allows a listed chapter origin to read the answer', async () => {
		const response = await post(VALID)

		expect(response.headers.get('access-control-allow-origin')).toBe(CHAPTER)
		expect(response.headers.get('vary')).toBe('Origin')
		expect(response.headers.get('cache-control')).toBe('no-store')
	})

	it('answers a preflight from a listed chapter origin', async () => {
		const response = await preflight(CHAPTER)

		expect(response.status).toBe(204)
		expect(response.headers.get('access-control-allow-origin')).toBe(CHAPTER)
		expect(response.headers.get('access-control-allow-methods')).toContain('POST')
		expect(response.headers.get('access-control-allow-headers')).toBe('Content-Type')
	})

	it.each(['https://evil.example', 'https://pauseai.es.evil.example', 'http://pauseai.es'])(
		'refuses %s, on both the preflight and the post',
		async (origin) => {
			const denied = await preflight(origin)
			expect(denied.status).toBe(403)
			expect(denied.headers.get('access-control-allow-origin')).toBeNull()

			const response = await post(VALID, { origin })
			expect(response.status).toBe(403)
			expect(response.headers.get('access-control-allow-origin')).toBeNull()
			expect(createRecord).not.toHaveBeenCalled()
		}
	)

	it('allows the site itself', async () => {
		expect((await post(VALID, { origin: SITE })).status).toBe(202)
	})

	it('accepts a request with no origin, sending no CORS header', async () => {
		const response = await post(VALID, { origin: null })

		expect(response.status).toBe(202)
		expect(response.headers.get('access-control-allow-origin')).toBeNull()
	})
})
