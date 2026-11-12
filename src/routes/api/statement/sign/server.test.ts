import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const createRecord = vi.fn<(...args: unknown[]) => Promise<unknown>>()
const hasMatchingRecord = vi.fn<(...args: unknown[]) => Promise<boolean | 'failed'>>()
const verifyTurnstile =
	vi.fn<(...args: unknown[]) => Promise<{ ok: boolean; message?: string; unavailable?: true }>>()
const appEnvironment = vi.hoisted(() => ({ dev: false }))

vi.mock('$app/environment', () => appEnvironment)
vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('#lib/airtable.ts', async (importOriginal) => ({
	airtableFormulaString: (await importOriginal<typeof import('#lib/airtable.ts')>())
		.airtableFormulaString,
	createRecord,
	hasMatchingRecord
}))
vi.mock('#lib/server/turnstile-verify.ts', () => ({ verifyTurnstile }))
const signInCrm = vi.fn<(...args: unknown[]) => Promise<'ok' | 'refused' | 'failed'>>()
vi.mock('#lib/server/statementCrm.ts', async (importOriginal) => ({
	...(await importOriginal<typeof import('#lib/server/statementCrm.ts')>()),
	signInCrm
}))

const { GET, OPTIONS, POST } = await import('./+server.js')
const { resetRateLimits } = await import('#lib/server/rateLimit.ts')

const SITE = 'https://pauseai.info'
const CHAPTER = 'https://pauseai.es'
const SECRET_EMAIL = 'ada@example.org'
const VALID = {
	name: 'Ada Lovelace',
	email: SECRET_EMAIL,
	country: 'Spain',
	bio: 'I care about this.',
	private: false,
	honeypot: '',
	turnstile_token: 'a-token'
}

type PostOptions = {
	origin?: string | null
	contentType?: string
	address?: string
	rawBody?: string
	site?: string
}

function post(body: unknown, options: PostOptions = {}) {
	const { origin = CHAPTER, contentType = 'application/json', address = '192.0.2.1' } = options
	const url = new URL(`${options.site ?? SITE}/api/statement/sign`)
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
	env.STATEMENT_SIGNING_LIVE = 'true'
	env.ONBOARDING_LIVE = undefined
	env.STATEMENT_BACKEND = undefined
	signInCrm.mockReset().mockResolvedValue('ok')
	appEnvironment.dev = false
	resetRateLimits()
	createRecord.mockReset().mockResolvedValue({ id: 'recAda', createdTime: '', fields: {} })
	hasMatchingRecord.mockReset().mockResolvedValue(false)
	verifyTurnstile.mockReset().mockResolvedValue({ ok: true })
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
})

describe('POST /api/statement/sign: Turnstile', () => {
	it.each([
		['a browser on a chapter site', CHAPTER],
		['a server, which sends no Origin', null]
	])('checks the token from %s, accepting chapter hostnames', async (_label, origin) => {
		await post(VALID, { origin })

		expect(verifyTurnstile).toHaveBeenCalledExactlyOnceWith('a-token', [
			'pauseai.info',
			'pauseai.es'
		])
	})

	it.each([
		['a browser on a chapter site', CHAPTER],
		['a server, which sends no Origin', null]
	])('refuses %s when the check fails, without writing', async (_label, origin) => {
		verifyTurnstile.mockResolvedValue({ ok: false, message: 'failed' })
		const response = await post(VALID, { origin })

		expect(response.status).toBe(403)
		expect(await response.json()).toEqual({ ok: false, error: 'turnstile_failed' })
		expect(createRecord).not.toHaveBeenCalled()
		expect(hasMatchingRecord).not.toHaveBeenCalled()
	})

	it('passes on no token at all when none, or a non-string, was sent', async () => {
		verifyTurnstile.mockResolvedValue({ ok: false, message: 'failed' })

		expect((await post({ ...VALID, turnstile_token: undefined })).status).toBe(403)
		expect((await post({ ...VALID, turnstile_token: { a: 1 } })).status).toBe(403)
		expect(verifyTurnstile.mock.calls.map(([token]) => token)).toEqual([undefined, undefined])
	})

	it('answers 503 when Turnstile itself is unavailable, without writing', async () => {
		verifyTurnstile.mockResolvedValue({ ok: false, unavailable: true, message: 'down' })
		const response = await post(VALID)

		expect(response.status).toBe(503)
		expect(await response.json()).toEqual({ ok: false, error: 'turnstile_unavailable' })
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('spends no token on a signature that is invalid anyway', async () => {
		expect((await post({ ...VALID, name: '' })).status).toBe(400)
		expect(verifyTurnstile).not.toHaveBeenCalled()
	})

	it('pretends success on a filled honeypot, without checking or writing', async () => {
		const response = await post({ ...VALID, honeypot: 'gotcha' })

		expect(response.status).toBe(202)
		expect(await response.json()).toEqual({ ok: true, status: 'pending_verification' })
		expect(verifyTurnstile).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})
})

describe('POST /api/statement/sign: repeat signatures', () => {
	it('looks up the address case-insensitively, over a window, reading no personal field', async () => {
		await post({ ...VALID, email: ' Ada@Example.ORG ' })

		const [base, table, formula, field] = hasMatchingRecord.mock.calls[0]
		expect(base).toBe('appWPTGqZmUcs3NWu')
		expect(table).toBe('tbl2emfOWNWoVz1kW')
		expect(formula).toBe(
			`AND(LOWER(TRIM({email})) = "ada@example.org", IS_AFTER(CREATED_TIME(), DATEADD(NOW(), -30, 'days')))`
		)
		expect(field).toBe('email_verified')
	})

	it('escapes the address in the formula', async () => {
		await post({ ...VALID, email: `o'brien\\x@example.org` })

		expect(hasMatchingRecord.mock.calls[0][2]).toContain(`= "o'brien\\\\x@example.org"`)
	})

	it('answers a repeat exactly as a new signature, writing nothing', async () => {
		const first = await post(VALID)
		const firstBody = await first.text()

		hasMatchingRecord.mockResolvedValue(true)
		createRecord.mockClear()
		const repeat = await post(VALID)

		expect(repeat.status).toBe(first.status)
		expect(await repeat.text()).toBe(firstBody)
		expect([...repeat.headers]).toEqual([...first.headers])
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('reports a failed lookup as a failed save, writing nothing', async () => {
		hasMatchingRecord.mockResolvedValue('failed')
		const response = await post(VALID)

		expect(response.status).toBe(502)
		expect(await response.json()).toEqual({ ok: false, error: 'save_failed' })
		expect(createRecord).not.toHaveBeenCalled()
	})
})

describe('POST /api/statement/sign: when signing is not live', () => {
	beforeEach(() => {
		env.STATEMENT_SIGNING_LIVE = undefined
	})

	it('refuses visibly on the real site, without checking or writing', async () => {
		const response = await post(VALID)

		expect(response.status).toBe(503)
		expect(await response.json()).toEqual({ ok: false, error: 'signing_unavailable' })
		expect(verifyTurnstile).not.toHaveBeenCalled()
		expect(hasMatchingRecord).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('refuses on an unknown hostname too, so a new domain cannot lose signatures', async () => {
		expect((await post(VALID, { site: 'https://pauseai.example' })).status).toBe(503)
	})

	it('does not treat ONBOARDING_LIVE as turning signing on', async () => {
		env.ONBOARDING_LIVE = 'true'

		expect((await post(VALID)).status).toBe(503)
		expect(createRecord).not.toHaveBeenCalled()
	})

	it.each([
		'http://localhost:37572',
		'http://127.0.0.1:4173',
		'https://deploy-preview-1261--pauseai.netlify.app'
	])('says it was a dry run on %s, without a token or a write', async (site) => {
		const response = await post({ ...VALID, turnstile_token: undefined }, { site, origin: site })

		expect(response.status).toBe(202)
		expect(await response.json()).toEqual({
			ok: true,
			status: 'pending_verification',
			dry_run: true
		})
		expect(verifyTurnstile).not.toHaveBeenCalled()
		expect(hasMatchingRecord).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('treats any hostname as a dry run on a dev server, as on a tailnet URL', async () => {
		appEnvironment.dev = true
		const site = 'https://machine.example.ts.net:5102'

		expect((await post(VALID, { site, origin: site })).status).toBe(202)
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('still validates in a dry run', async () => {
		const site = 'http://localhost:37572'

		expect((await post({ ...VALID, name: '' }, { site, origin: site })).status).toBe(400)
	})

	it('still catches the honeypot in a dry run, with no sign of a dry run', async () => {
		const site = 'http://localhost:37572'
		const response = await post({ ...VALID, honeypot: 'x' }, { site, origin: site })

		expect(await response.json()).toEqual({ ok: true, status: 'pending_verification' })
	})
})

describe('GET /api/statement/sign', () => {
	const mode = async (site: string) => {
		const url = new URL(`${site}/api/statement/sign`)
		const response = await GET({ request: new Request(url), url } as never)
		return { response, body: await response.json() }
	}

	it('reports each mode, cached briefly per origin', async () => {
		const live = await mode(SITE)
		expect(live.body).toEqual({ mode: 'live' })
		expect(live.response.headers.get('cache-control')).toBe('public, max-age=300')
		expect(live.response.headers.get('vary')).toBe('Origin')

		env.STATEMENT_SIGNING_LIVE = undefined
		expect((await mode(SITE)).body).toEqual({ mode: 'off' })
		expect((await mode('http://localhost:37572')).body).toEqual({ mode: 'dry_run' })
	})
})

describe('POST /api/statement/sign: validation', () => {
	it.each([
		['missing name', { name: '  ' }, { name: 'required' }],
		['overlong name', { name: 'x'.repeat(201) }, { name: 'too_long' }],
		['missing email', { email: '' }, { email: 'required' }],
		['malformed email', { email: 'not-an-email' }, { email: 'invalid' }],
		['unknown country', { country: 'Atlantis' }, { country: 'invalid' }],
		['overlong bio', { bio: 'x'.repeat(2001) }, { bio: 'too_long' }],
		['non-string bio', { bio: 42 }, { bio: 'invalid' }],
		['stringly private', { private: 'true' }, { private: 'invalid' }],
		['missing private', { private: undefined }, { private: 'required' }],
		['unknown language', { language: 'fr' }, { language: 'invalid' }],
		['differently cased language', { language: 'ES' }, { language: 'invalid' }],
		['non-string language', { language: 1 }, { language: 'invalid' }]
	])('refuses %s, naming the field and not writing', async (_label, change, fields) => {
		const response = await post({ ...VALID, ...change })

		expect(response.status).toBe(400)
		expect(await response.json()).toEqual({ ok: false, error: 'validation_failed', fields })
		expect(createRecord).not.toHaveBeenCalled()
	})

	it.each(['en', 'es', undefined, null])(
		'accepts the language %j, and stores none',
		async (language) => {
			const response = await post({ ...VALID, language })

			expect(response.status).toBe(202)
			expect(createRecord.mock.calls[0][2]).not.toHaveProperty('language')
		}
	)

	it.each([
		'a,b@example.org',
		'a;b@example.org',
		'a<b@example.org',
		'a>b@example.org',
		'a"b@example.org',
		'ada@example.org, other@example.org',
		'Ada <ada@example.org>',
		'ada@exam\u0000ple.org',
		'ada\r\nbcc:@example.org',
		'ada‮@example.org',
		'ada@example,org.uk'
	])('refuses the email %j', async (email) => {
		const response = await post({ ...VALID, email })

		expect(response.status).toBe(400)
		expect(await response.json()).toMatchObject({ fields: { email: 'invalid' } })
	})

	it.each([
		'ada@example.org',
		'ada.lovelace+statement@example.org',
		"o'brien@example.org",
		'josé@ejemplo.es',
		'ada@例え.jp',
		'ada@sub.example.co.uk'
	])('accepts the email %j', async (email) => {
		expect((await post({ ...VALID, email })).status).toBe(202)
	})

	it.each([
		['a null byte', 'Ada\u0000Lovelace'],
		['a line break', 'Ada\nLovelace'],
		['a carriage return', 'Ada\r\nBcc: x'],
		['a tab', 'Ada\tLovelace'],
		['a C1 control', 'Ada\u0085Lovelace'],
		['a bidi override', 'Ada‮Lovelace'],
		['a bidi isolate', 'Ada⁦Lovelace'],
		['an http link', 'Visit http://evil.example now'],
		['a scheme-relative mention', 'hxxp://evil.example'],
		['a bare domain', 'evil.com'],
		['a domain in words', 'Click evil.example/offer today'],
		['a domain after punctuation', '(evil.com)'],
		['a subdomain', 'www.evil.co.uk'],
		['a non-Latin domain', 'пример.рф'],
		['a full-width dot', 'evil。com'],
		['an IP address', 'See 192.0.2.1'],
		['a mailto link', 'mailto:ada@example.org'],
		['an email address', 'ada@example.org'],
		['a domain behind a title', 'dr.evil.com'],
		['a list with a domain', 'Ada,evil.com']
	])('refuses a name with %s', async (_label, name) => {
		const response = await post({ ...VALID, name })

		expect(response.status).toBe(400)
		expect(await response.json()).toMatchObject({ fields: { name: 'invalid' } })
	})

	it.each([
		'Ada Lovelace',
		"Conan O'Brien",
		'Mary-Jane Watson-Parker',
		'Jean-Luc Picard',
		'J.R.R. Tolkien',
		'J. R. Smith',
		'A.P.J. Abdul Kalam',
		'S.Ramesh',
		'Martin Luther King, Jr.',
		'Dr. Ada Lovelace',
		'Dr.Smith',
		'Prof.Dr. Müller',
		'Prof. Dr. Hans Müller',
		'Ada Lovelace, Ph.D',
		'Ada Lovelace, Ph.D.',
		'José García Núñez',
		'Ó Briain',
		'Nguyễn Văn An',
		'Søren Kierkegaard',
		'Анна Каренина',
		'محمد علي',
		'דוד כהן',
		'李明',
		'佐藤 健',
		'김민수',
		'प्रिया शर्मा',
		'தமிழ் செல்வன்',
		'Αλέξανδρος',
		'ሰላም ተስፋ',
		'نرگس‌محمدی',
		'محمد‏ علي'
	])('accepts the name %j', async (name) => {
		const response = await post({ ...VALID, name })

		expect(response.status).toBe(202)
		expect(createRecord.mock.calls[0][2]).toMatchObject({ name })
	})

	it.each([
		['a null byte', 'Why\u0000this'],
		['a backspace', 'Why\bthis'],
		['a bidi override', 'Why‮this'],
		['a bidi isolate', 'Why⁧this']
	])('refuses a bio with %s', async (_label, bio) => {
		const response = await post({ ...VALID, bio })

		expect(response.status).toBe(400)
		expect(await response.json()).toMatchObject({ fields: { bio: 'invalid' } })
	})

	it.each([
		'Line one\nLine two',
		'Tabbed\tout',
		'See https://example.org for why',
		'لأن هذا مهم‏',
		'👩‍🔬 researcher'
	])('accepts the bio %j', async (bio) => {
		expect((await post({ ...VALID, bio })).status).toBe(202)
	})
})

describe('POST /api/statement/sign: refusals', () => {
	it('refuses a body that is not JSON', async () => {
		const response = await post(null, { rawBody: '{nope' })

		expect(response.status).toBe(400)
		expect(await response.json()).toEqual({ ok: false, error: 'invalid_json' })
	})

	it('refuses JSON that is not an object', async () => {
		expect((await post([VALID])).status).toBe(400)
	})

	it('refuses other content types', async () => {
		const response = await post(VALID, { contentType: 'application/xml' })

		expect(response.status).toBe(415)
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('refuses an oversized body', async () => {
		const response = await post({ ...VALID, padding: 'x'.repeat(33 * 1024) })

		expect(response.status).toBe(413)
		expect(createRecord).not.toHaveBeenCalled()
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
		hasMatchingRecord.mockResolvedValue('failed')
		await post(VALID)
		env.STATEMENT_SIGNING_LIVE = undefined
		await post(VALID)
		await post(VALID, { site: 'http://localhost:37572', origin: 'http://localhost:37572' })

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

describe('POST /api/statement/sign: rate limits', () => {
	const SAVE_LIMIT = 30

	async function saveUpToLimit(address = '192.0.2.1') {
		for (let save = 0; save < SAVE_LIMIT; save++) {
			expect((await post(VALID, { address })).status).toBe(202)
		}
	}

	it('limits saves from one address, and not from another', async () => {
		await saveUpToLimit()
		const limited = await post(VALID)

		expect(limited.status).toBe(429)
		expect(await limited.json()).toEqual({ ok: false, error: 'rate_limited' })
		expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0)
		expect(limited.headers.get('access-control-allow-origin')).toBe(CHAPTER)
		expect(createRecord).toHaveBeenCalledTimes(SAVE_LIMIT)

		expect((await post(VALID, { address: '192.0.2.2' })).status).toBe(202)
	})

	it('counts one IPv6 /64 as one sender, and another /64 apart', async () => {
		for (let save = 0; save < SAVE_LIMIT; save++) {
			const address = `2001:db8:1:2::${save.toString(16)}`
			expect((await post(VALID, { address })).status).toBe(202)
		}

		expect((await post(VALID, { address: '2001:db8:1:2:ffff::1' })).status).toBe(429)
		expect((await post(VALID, { address: '2001:db8:1:3::1' })).status).toBe(202)
	})

	it.each([
		['validation errors', { name: '' }, () => {}],
		[
			'Turnstile failures',
			{},
			() => verifyTurnstile.mockResolvedValue({ ok: false, message: 'failed' })
		],
		['failed saves', {}, () => createRecord.mockResolvedValue(undefined)],
		['failed lookups', {}, () => hasMatchingRecord.mockResolvedValue('failed')]
	])('does not count %s against an address', async (_label, change, arrange) => {
		arrange()
		for (let attempt = 0; attempt < SAVE_LIMIT + 5; attempt++) {
			expect((await post({ ...VALID, ...change })).status).not.toBe(429)
		}

		verifyTurnstile.mockResolvedValue({ ok: true })
		hasMatchingRecord.mockResolvedValue(false)
		createRecord.mockResolvedValue({ id: 'recAda', createdTime: '', fields: {} })
		expect((await post(VALID)).status).toBe(202)
	})

	it('counts a skipped repeat like a save, so the limit reveals nothing', async () => {
		vi.spyOn(globalThis, 'setTimeout').mockImplementation(((run: () => void) => {
			run()
			return 0
		}) as never)
		hasMatchingRecord.mockResolvedValue(true)
		await saveUpToLimit()

		expect((await post(VALID)).status).toBe(429)
	})

	describe('overall limit', () => {
		const addressOf = (index: number) => `198.51.${Math.floor(index / 250)}.${index % 250}`
		const OVERALL_LIMIT = 120

		it('applies across addresses', async () => {
			for (let index = 0; index < OVERALL_LIMIT; index++) {
				expect((await post(VALID, { address: addressOf(index) })).status).toBe(202)
			}
			const limited = await post(VALID, { address: addressOf(OVERALL_LIMIT) })

			expect(limited.status).toBe(429)
			expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0)
			expect(createRecord).toHaveBeenCalledTimes(OVERALL_LIMIT)
		})

		it('cannot be used up by traffic that fails Turnstile', async () => {
			verifyTurnstile.mockResolvedValue({ ok: false, message: 'failed' })
			for (let index = 0; index < OVERALL_LIMIT + 50; index++) {
				expect((await post(VALID, { address: addressOf(index) })).status).toBe(403)
			}

			verifyTurnstile.mockResolvedValue({ ok: true })
			expect((await post(VALID, { address: '203.0.113.1' })).status).toBe(202)
		})

		it('cannot be used up by traffic with nothing valid to save', async () => {
			for (let index = 0; index < OVERALL_LIMIT + 50; index++) {
				await post({ ...VALID, name: '' }, { address: addressOf(index) })
			}

			expect((await post(VALID, { address: '203.0.113.1' })).status).toBe(202)
		})
	})
})

describe('/api/statement/sign: CORS', () => {
	it('allows a listed chapter origin to read the answer and Retry-After', async () => {
		const response = await post(VALID)

		expect(response.headers.get('access-control-allow-origin')).toBe(CHAPTER)
		expect(response.headers.get('access-control-expose-headers')).toBe('Retry-After')
		expect(response.headers.get('vary')).toBe('Origin')
		expect(response.headers.get('cache-control')).toBe('no-store')
	})

	it('exposes Retry-After on the rate limit answer itself', async () => {
		for (let save = 0; save < 30; save++) await post(VALID)
		const limited = await post(VALID)

		expect(limited.status).toBe(429)
		expect(limited.headers.get('access-control-expose-headers')).toBe('Retry-After')
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
			expect(response.headers.get('access-control-expose-headers')).toBeNull()
			expect(createRecord).not.toHaveBeenCalled()
		}
	)

	it('allows the site itself', async () => {
		expect((await post(VALID, { origin: SITE })).status).toBe(202)
	})

	it('holds a request with no origin to the same token check, sending no CORS header', async () => {
		const response = await post(VALID, { origin: null })

		expect(response.status).toBe(202)
		expect(verifyTurnstile).toHaveBeenCalledOnce()
		expect(response.headers.get('access-control-allow-origin')).toBeNull()
	})
})

describe('POST /api/statement/sign: STATEMENT_BACKEND=civicrm', () => {
	beforeEach(() => {
		env.STATEMENT_BACKEND = 'civicrm'
	})

	it('signs in CiviCRM with the email language and a 20 s deadline, touching no Airtable table', async () => {
		const sent = Date.now()
		const response = await post({ ...VALID, language: 'es' })

		expect(response.status).toBe(202)
		expect(await response.json()).toEqual({ ok: true, status: 'pending_verification' })
		expect(signInCrm).toHaveBeenCalledExactlyOnceWith(
			{
				name: 'Ada Lovelace',
				email: SECRET_EMAIL,
				country: 'Spain',
				bio: 'I care about this.',
				private: false,
				language: 'es'
			},
			{ deadline: expect.any(Number) as unknown, platform: undefined }
		)
		const { deadline } = signInCrm.mock.calls[0][1] as { deadline: number }
		expect(deadline - sent).toBeGreaterThanOrEqual(20_000)
		expect(deadline - Date.now()).toBeLessThanOrEqual(20_000)
		expect(hasMatchingRecord).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('defaults the email language to English', async () => {
		await post(VALID)

		expect(signInCrm.mock.calls[0][0]).toMatchObject({ language: 'en' })
	})

	it('answers a failure as a failed save, never as accepted', async () => {
		signInCrm.mockResolvedValue('failed')
		const response = await post(VALID)

		expect(response.status).toBe(502)
		expect(await response.json()).toEqual({ ok: false, error: 'save_failed' })
	})

	it('answers a refusal as invalid, naming no field', async () => {
		signInCrm.mockResolvedValue('refused')
		const response = await post(VALID)

		expect(response.status).toBe(400)
		expect(await response.json()).toEqual({ ok: false, error: 'validation_failed', fields: {} })
	})

	it('keeps validation, Turnstile and the honeypot in front of CiviCRM', async () => {
		expect((await post({ ...VALID, name: '' })).status).toBe(400)
		verifyTurnstile.mockResolvedValueOnce({ ok: false, message: 'no' })
		expect((await post(VALID)).status).toBe(403)
		expect((await post({ ...VALID, honeypot: 'bot' })).status).toBe(202)
		expect(signInCrm).not.toHaveBeenCalled()
	})

	it('counts saves against the rate limit, but not failures', async () => {
		signInCrm.mockResolvedValue('failed')
		for (let i = 0; i < 31; i++) await post(VALID)
		signInCrm.mockResolvedValue('ok')
		for (let i = 0; i < 30; i++) expect((await post(VALID)).status).toBe(202)
		expect((await post(VALID)).status).toBe(429)
	})

	it('still writes nothing in a dry run', async () => {
		env.STATEMENT_SIGNING_LIVE = undefined
		const response = await post(VALID, { site: 'http://localhost:37572' })

		expect(await response.json()).toMatchObject({ dry_run: true })
		expect(signInCrm).not.toHaveBeenCalled()
	})
})
