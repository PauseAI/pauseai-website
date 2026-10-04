import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAPTER_OVERRIDE_COUNTRIES } from './chapterOverrides.js'
import { escapeHtml } from './markdown.js'
import type { OnboardingEmailV2Params, OnboardingRouting } from './types.js'

vi.mock('$env/dynamic/private', () => ({ env: {} }))
vi.mock('$lib/server/sentry', () => ({ reportError: vi.fn() }))

const { renderOnboardingEmailV2 } = await import('./index.js')
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
	return {
		kind: 'chapter',
		chapterId: 7,
		name,
		country,
		links: [
			{ label: 'Website', url: 'https://example.org/' },
			{ label: 'WhatsApp', url: 'https://chat.whatsapp.com/example' },
			{ label: 'Events', url: 'https://luma.com/example' }
		]
	}
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

beforeEach(() => {
	// v2 reads nothing: any network call fails the test.
	vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('v2 must not fetch'))
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
		expect(globalThis.fetch).not.toHaveBeenCalled()
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

	it.each([
		['missing first name', { first_name: '' }],
		['non-string intent', { intent: 3 }],
		['non-boolean keep_informed', { keep_informed: 'yes' }],
		['an unknown field', { airtable_id: 'recTest1234567890' }],
		['no routing', { routing: undefined }],
		['an unknown routing kind', { routing: { kind: 'country' } }],
		['a chapter without an id', { routing: { kind: 'chapter', name: 'X', country: 'Y' } }],
		[
			'a chapter link with an unknown label',
			{
				routing: {
					kind: 'chapter',
					chapter_id: 1,
					name: 'X',
					country: 'Y',
					links: [{ label: 'Blog', url: 'https://example.org' }]
				}
			}
		],
		[
			'a chapter link that is not https',
			{
				routing: {
					kind: 'chapter',
					chapter_id: 1,
					name: 'X',
					country: 'Y',
					links: [{ label: 'Website', url: 'javascript:alert(1)' }]
				}
			}
		]
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
