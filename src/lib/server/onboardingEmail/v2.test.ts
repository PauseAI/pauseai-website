import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAPTER_OVERRIDE_COUNTRIES } from './chapterOverrides.js'
import { escapeHtml } from './markdown.js'
import type { OnboardingEmailV2Params, OnboardingRouting } from './types.js'

// Stands in for the live National Groups table, which v1 and v2 both read chapter links from.
const NATIONAL_GROUPS = [
	{
		id: 'recCanada',
		fields: {
			country: 'Canada',
			website: 'https://pauseai.ca/',
			luma: 'https://luma.com/pauseai-canada',
			discord: 'https://discord.gg/canada'
		}
	},
	{
		id: 'recSweden',
		fields: {
			country: 'Sweden',
			website: 'pauseai.se',
			whatsapp: 'https://chat.whatsapp.com/sweden',
			luma: 'https://luma.com/pauseai-sweden'
		}
	},
	{
		id: 'recUnitedKingdom',
		fields: { country: 'United Kingdom', website: 'https://pauseai.uk/' }
	},
	{
		id: 'recNetherlands',
		fields: {
			country: 'Netherlands',
			website: 'https://pauseai.nl/',
			whatsapp: 'https://chat.whatsapp.com/example',
			luma: 'https://luma.com/example'
		}
	}
]

const { fetchAllPages, reportError } = vi.hoisted(() => ({
	fetchAllPages: vi.fn(),
	reportError: vi.fn()
}))
vi.mock('$env/dynamic/private', () => ({ env: {} }))
vi.mock('$lib/server/sentry', () => ({ reportError }))
vi.mock('$lib/airtable.js', async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	fetchAllPages
}))

const { renderOnboardingEmail, renderOnboardingEmailV2 } = await import('./index.js')
const { parseV2Request } = await import('./v2Request.js')
const { mintVerificationToken, verificationLink, verifyVerificationToken } =
	await import('$lib/server/emailVerification')

const SECRET = 'verification-secret'
const NOW = Date.parse('2026-10-05T12:00:00Z')
const RECORD_ID = 'recTest1234567890'
const TO_EMAIL = 'Alex@Example.org'
// What the website's own mint gives for this row and address at NOW.
const LINK = verificationLink(
	'Test1234567890',
	await mintVerificationToken(SECRET, RECORD_ID, TO_EMAIL, NOW)
)
const INTENTS = ['None', 'Keep informed', 'Act now', 'Volunteer', 'Lead', '']
const KEEP_INFORMED = [true, false, undefined]

function chapter(country: string, name = `PauseAI ${country}`): OnboardingRouting {
	return { kind: 'chapter', chapterId: 7, name, country }
}

const ROUTINGS: OnboardingRouting[] = [
	{ kind: 'global' },
	chapter('Netherlands'),
	chapter('France', 'Pause IA'),
	...CHAPTER_OVERRIDE_COUNTRIES.map((country) => chapter(country))
]

function render(params: Partial<OnboardingEmailV2Params> = {}) {
	return renderOnboardingEmailV2(
		{
			firstName: 'Alex',
			language: 'en',
			routing: { kind: 'global' },
			recordId: RECORD_ID,
			toEmail: TO_EMAIL,
			...params
		},
		SECRET,
		NOW
	)
}

function tokenOf(text: string): string {
	return /[?&]token=(v1\.\d+\.[A-Za-z0-9_-]{43})/.exec(text)?.[1] ?? ''
}

// Every https URL in a body other than the verification link: the chapter's links.
function chapterUrls(text: string): string[] {
	return [...text.matchAll(/https:\/\/[^\s)\]"<>]+/g)]
		.map(([found]) => found)
		.filter((found) => !found.startsWith('https://pauseai.info/'))
		.sort()
}

beforeEach(() => {
	fetchAllPages.mockReset().mockResolvedValue(NATIONAL_GROUPS)
	reportError.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('renderOnboardingEmailV2', () => {
	// The caller sends what comes back, so this is the only check that the link is in it.
	it('carries the signed verification link in both bodies of every variant', async () => {
		let variants = 0
		for (const language of ['en', 'es'] as const) {
			for (const routing of ROUTINGS) {
				for (const intent of INTENTS) {
					for (const keepInformed of KEEP_INFORMED) {
						const email = await render({ language, routing, intent, keepInformed })
						const where = `${language} / ${routing.kind === 'chapter' ? routing.country : 'global'} / ${intent || '(empty)'} / ${keepInformed}`
						expect(email.text, where).toContain(LINK)
						expect(email.html, where).toContain(`href="${escapeHtml(LINK)}"`)
						variants++
					}
				}
			}
		}
		expect(variants).toBe(2 * ROUTINGS.length * INTENTS.length * KEEP_INFORMED.length)
	})

	it('shows the same chapter links v1 shows for the same chapter', async () => {
		for (const country of ['Canada', 'Sweden', 'Netherlands']) {
			for (const intent of ['Volunteer', 'Act now', 'None']) {
				const v1 = await renderOnboardingEmail({
					firstName: 'Alex',
					country,
					intent,
					chapterShare: true,
					airtable_id: 'Test1234567890',
					verificationLink: LINK
				})
				const v2 = await render({ routing: chapter(country), intent })
				const where = `${country} / ${intent}`
				expect(chapterUrls(v2.text), where).toEqual(chapterUrls(v1.text))
				expect(chapterUrls(v2.html), where).toEqual(chapterUrls(v1.html))
			}
		}
		// The rows' links do reach the emails, so the comparison above is not of two empty lists.
		const sweden = await render({ routing: chapter('Sweden'), intent: 'Volunteer' })
		expect(sweden.text).toContain('https://chat.whatsapp.com/sweden')
		const canada = await render({ routing: chapter('Canada'), intent: 'Volunteer' })
		expect(canada.text).toContain('https://luma.com/pauseai-canada')
	})

	it('reads no chapter links for a member routed to global onboarding', async () => {
		await render({ intent: 'Volunteer', routing: { kind: 'global' } })
		expect(fetchAllPages).not.toHaveBeenCalled()
	})

	it('renders without chapter links when National Groups cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		fetchAllPages.mockRejectedValue(new Error('Airtable is down'))
		const email = await render({ intent: 'Volunteer', routing: chapter('Netherlands') })
		expect(email.text).toContain('PauseAI Netherlands will be in touch')
		expect(email.text).not.toContain('https://chat.whatsapp.com/example')
		expect(email.text).toContain(LINK)
		expect(reportError).toHaveBeenCalledOnce()
		const [, context] = reportError.mock.calls[0] as [unknown, Record<string, unknown>]
		expect(context).toMatchObject({ recordId: RECORD_ID })
		expect(JSON.stringify(context).toLowerCase()).not.toContain('alex')
	})

	it('signs a token that verifies for that row and address only', async () => {
		const token = tokenOf((await render()).text)
		expect(token).toMatch(/^v1\./)
		expect(await verifyVerificationToken(SECRET, RECORD_ID, 'alex@example.org', token, NOW)).toBe(
			'valid'
		)
		expect(await verifyVerificationToken(SECRET, RECORD_ID, 'other@example.org', token, NOW)).toBe(
			'invalid'
		)
		expect(await verifyVerificationToken(SECRET, 'recOther123456789', TO_EMAIL, token, NOW)).toBe(
			'invalid'
		)
	})

	it('never puts the address in the email', async () => {
		const email = await render()
		for (const body of [email.subject, email.html, email.text]) {
			expect(body.toLowerCase()).not.toContain('alex@example.org')
		}
	})

	it('reaches every chapter override through chapter routing', async () => {
		for (const country of CHAPTER_OVERRIDE_COUNTRIES) {
			const overrides = await Promise.all(
				INTENTS.map(
					async (intent) => (await render({ routing: chapter(country), intent })).chapterOverride
				)
			)
			expect(
				overrides.some((override) => override !== null),
				country
			).toBe(true)
		}
	})

	it('follows the given routing, not the country', async () => {
		const global = await render({ intent: 'Volunteer', routing: { kind: 'global' } })
		expect(global.text).toContain('Our onboarding team will be in touch.')
		expect(global.text).not.toContain('PauseAI chapter')
		expect(global.chapterOverride).toBeNull()

		const routed = await render({ intent: 'Volunteer', routing: chapter('Netherlands') })
		expect(routed.text).toContain('PauseAI Netherlands will be in touch')
		expect(routed.text).toContain('https://chat.whatsapp.com/example')
	})

	it('names the chapter by its own name where it says who will be in touch', async () => {
		const email = await render({ intent: 'Lead', routing: chapter('France', 'Pause IA') })
		expect(email.text).toContain('Pause IA will be in touch')
		expect(email.text).not.toContain('PauseAI France')
	})

	it("gives a chapter's own email only when routed to that chapter", async () => {
		const uk = await render({
			intent: 'Volunteer',
			routing: chapter('United Kingdom', 'PauseAI UK')
		})
		expect(uk.chapterOverride).not.toBeNull()
		expect(uk.subject).toBe('Welcome to PauseAI UK Alex!')

		const german = await render({ intent: 'Volunteer', routing: chapter('Germany') })
		expect(german.language).toBe('de')
		expect(german.html).toContain(`href="${escapeHtml(LINK)}"`)

		// A UK member routed to global onboarding gets the shared copy.
		const fallback = await render({ intent: 'Volunteer', routing: { kind: 'global' } })
		expect(fallback.chapterOverride).toBeNull()
		expect(fallback.subject).toBe('Welcome to PauseAI, Alex!')
	})

	it('writes each supported language', async () => {
		const english = await render({ intent: 'Volunteer' })
		expect(english.language).toBe('en')
		expect(english.text).toContain('To confirm your email address')

		const spanish = await render({ intent: 'Volunteer', language: 'es' })
		expect(spanish.language).toBe('es')
		expect(spanish.text).toContain('haz clic en')
		expect(spanish.text).not.toContain('critical alert')
	})

	it('states the newsletter line from the Keep me informed answer', async () => {
		expect((await render({ intent: 'Volunteer', keepInformed: true })).text).toContain(
			"You'll receive the PauseAI monthly update"
		)
		expect((await render({ intent: 'Volunteer', keepInformed: false })).text).toContain(
			"You didn't opt in to our newsletter"
		)
		expect((await render({ intent: 'Volunteer' })).text).toContain(
			'If you opted in to our newsletter'
		)
	})

	it('returns no sender', async () => {
		expect(await render()).not.toHaveProperty('from')
		expect(await render({ routing: chapter('United Kingdom') })).not.toHaveProperty('from')
	})
})

// The same member, as the Airtable automation asks v1 for them and as the CRM asks v2.
type Member = {
	country: string
	/** What the CRM sends for the same country. */
	countryCode: string
	languages: string[]
	chapterShare: boolean
	routing: Record<string, unknown>
}

const routedTo = (country: string, countryCode: string) => ({
	kind: 'chapter',
	chapter_id: 7,
	// v1 names a chapter "PauseAI <country>"; v2 takes the CRM's name for it.
	name: `PauseAI ${country}`,
	country_code: countryCode
})

const MEMBERS: Record<string, Member> = {
	'United Kingdom': {
		country: 'United Kingdom',
		countryCode: 'GB',
		languages: ['English'],
		chapterShare: true,
		routing: routedTo('United Kingdom', 'GB')
	},
	Sweden: {
		country: 'Sweden',
		countryCode: 'SE',
		languages: [],
		chapterShare: true,
		routing: routedTo('Sweden', 'SE')
	},
	'Canada, French': {
		country: 'Canada',
		countryCode: 'CA',
		languages: ['French', 'English'],
		chapterShare: true,
		routing: routedTo('Canada', 'CA')
	},
	'Netherlands, Spanish': {
		country: 'Netherlands',
		countryCode: 'NL',
		languages: ['Spanish'],
		chapterShare: true,
		routing: routedTo('Netherlands', 'NL')
	},
	'Mexico, no chapter': {
		country: 'Mexico',
		countryCode: 'mx',
		languages: [],
		chapterShare: false,
		routing: { kind: 'global' }
	},
	'no chapter': {
		country: 'Japan',
		countryCode: 'JP',
		languages: [],
		chapterShare: false,
		routing: { kind: 'global' }
	}
}

describe('v1 and v2 parity', () => {
	it.each(Object.entries(MEMBERS))(
		'render the same email for %s',
		async (_name, { country, countryCode, languages, chapterShare, routing }) => {
			for (const intent of ['Volunteer', 'Act now', 'None']) {
				for (const keepInformed of KEEP_INFORMED) {
					const v1 = await renderOnboardingEmail({
						firstName: 'Alex',
						country,
						languages,
						intent,
						subscribed: keepInformed,
						chapterShare,
						airtable_id: 'Test1234567890',
						verificationLink: LINK
					})
					const parsed = parseV2Request({
						version: 2,
						first_name: 'Alex',
						languages,
						country_code: countryCode,
						intent,
						keep_informed: keepInformed ?? null,
						routing,
						record_id: RECORD_ID,
						to_email: TO_EMAIL
					})
					if (!parsed.ok) throw new Error(parsed.error.message)
					const v2 = await renderOnboardingEmailV2(parsed.params, SECRET, NOW)
					const where = `${intent} / ${keepInformed}`
					expect(v2.subject, where).toBe(v1.subject)
					expect(v2.text, where).toBe(v1.text)
					expect(v2.html, where).toBe(v1.html)
				}
			}
		}
	)
})

describe('parseV2Request', () => {
	const valid = {
		version: 2,
		first_name: 'Alex',
		language: 'en',
		country: 'Netherlands',
		intent: 'Volunteer',
		keep_informed: true,
		routing: { kind: 'global' },
		record_id: RECORD_ID,
		to_email: TO_EMAIL
	}

	function parse(overrides: Record<string, unknown>) {
		return parseV2Request({ ...valid, ...overrides })
	}

	function errorOf(overrides: Record<string, unknown>) {
		const result = parse(overrides)
		if (result.ok) throw new Error('expected a refusal')
		return result.error
	}

	it('accepts a full request', () => {
		const result = parse({})
		expect(result.ok && result.params.recordId).toBe(RECORD_ID)
		expect(result.ok && result.params.toEmail).toBe(TO_EMAIL)
	})

	it('accepts only version 2', () => {
		expect(errorOf({ version: 1 }).code).toBe('unsupported_version')
		expect(errorOf({ version: undefined }).code).toBe('unsupported_version')
	})

	it('falls back to English for a language the copy is not written in', () => {
		for (const [language, expected] of [
			['es-MX', 'es'],
			['es_ES', 'es'],
			['ES', 'es'],
			['fr', 'en'],
			['de', 'en']
		]) {
			const result = parse({ language })
			expect(result.ok && result.params.language, language).toBe(expected)
		}
	})

	it('takes the language from the country only when none is given', () => {
		const fromCountry = parse({ language: null, country: 'Mexico' })
		expect(fromCountry.ok && fromCountry.params.language).toBe('es')
		const given = parse({ language: 'en', country: 'Mexico' })
		expect(given.ok && given.params.language).toBe('en')
	})

	it('resolves the language from languages with the rule v1 uses', () => {
		for (const [languages, country, expected] of [
			[['Spanish'], 'Netherlands', 'es'],
			[['English', 'Español'], 'Netherlands', 'es'],
			[['English'], 'Netherlands', 'en'],
			[[], 'Netherlands', 'en'],
			[[], 'Mexico', 'es'],
			[['English'], 'Mexico', 'es']
		] as const) {
			const result = parse({ language: undefined, languages, country })
			expect(result.ok && result.params.language, `${languages.join()} / ${country}`).toBe(expected)
		}
	})

	it('takes the country from country_code, before country', () => {
		const tanzania = parse({ language: undefined, country: undefined, country_code: 'TZ' })
		expect(tanzania.ok && tanzania.params.language).toBe('en')
		const mexico = parse({ language: undefined, country: 'Netherlands', country_code: 'mx' })
		expect(mexico.ok && mexico.params.language).toBe('es')
	})

	it('treats a well-formed code the website does not know as no country', () => {
		const result = parse({ language: undefined, country: undefined, country_code: 'ZZ' })
		expect(result.ok && result.params.language).toBe('en')
	})

	it('resolves a chapter routing by its country code', () => {
		const result = parse({
			routing: { kind: 'chapter', chapter_id: 1, name: 'X', country_code: 'GB' }
		})
		expect(result.ok && result.params.routing).toMatchObject({ country: 'United Kingdom' })
		const unknown = errorOf({
			routing: { kind: 'chapter', chapter_id: 1, name: 'X', country_code: 'ZZ' }
		})
		expect(unknown.message).toContain('routing.country_code')
	})

	it('prefers languages to language', () => {
		const result = parse({ language: 'es', languages: ['English'] })
		expect(result.ok && result.params.language).toBe('en')
	})

	it('ignores chapter links sent by the caller', () => {
		const result = parse({
			routing: {
				kind: 'chapter',
				chapter_id: 1,
				name: 'X',
				country: 'Y',
				links: [{ label: 'Website', url: 'javascript:alert(1)' }]
			}
		})
		expect(result.ok && result.params.routing).toEqual({
			kind: 'chapter',
			chapterId: 1,
			name: 'X',
			country: 'Y'
		})
	})

	it.each([
		['missing first name', { first_name: '' }],
		['non-string intent', { intent: 3 }],
		['non-boolean keep_informed', { keep_informed: 'yes' }],
		['an unknown field', { airtable_id: 'recTest1234567890' }],
		['no routing', { routing: undefined }],
		['an unknown routing kind', { routing: { kind: 'country' } }],
		['a chapter without an id', { routing: { kind: 'chapter', name: 'X', country: 'Y' } }],
		['languages that are not an array', { languages: 'Spanish' }],
		['a country code that is not two letters', { country_code: 'GBR' }],
		['a chapter without a country', { routing: { kind: 'chapter', chapter_id: 1, name: 'X' } }],
		['languages that are not strings', { languages: [3] }]
	])('refuses %s', (_name, overrides) => {
		expect(errorOf(overrides).code).toBe('invalid_request')
	})

	it.each([
		['no record id', { record_id: undefined }],
		['a record id without rec', { record_id: 'Test1234567890' }],
		['a short record id', { record_id: 'recTest' }],
		['a record id with other characters', { record_id: 'recTest12345678)0' }],
		['no address', { to_email: undefined }],
		['an address without @', { to_email: 'alex.example.org' }],
		['an address with spaces inside', { to_email: 'alex smith@example.org' }],
		['a verification link instead', { verification_link: LINK }]
	])('refuses %s', (_name, overrides) => {
		const error = errorOf(overrides)
		expect(error.code).toBe('invalid_request')
		expect(error.message).not.toContain('example.org')
	})
})
