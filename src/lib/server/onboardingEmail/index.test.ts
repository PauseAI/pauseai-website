import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChapterBlockData, OnboardingEmailParams } from './types.js'

// Stands in for the live National Groups table: one chapter with links, one without.
const CHAPTERS: Record<string, ChapterBlockData> = {
	netherlands: {
		name: 'Netherlands',
		links: [{ label: 'WhatsApp', url: 'https://chat.whatsapp.com/example' }]
	},
	belgium: { name: 'Belgium', links: [] },
	spain: { name: 'Spain', links: [{ label: 'Website', url: 'https://pauseai.es' }] },
	// The chapters whose own emails draw their links from these rows. The UK's email has its
	// links fixed in code, so it needs no row here.
	sweden: {
		name: 'Sweden',
		links: [
			{ label: 'Website', url: 'https://pauseai.se/' },
			// Carries markdown of its own: a row value is free text, and the Swedish email splices
			// it into a sentence rather than rendering it as a bare link.
			{ label: 'WhatsApp', url: 'https://chat.whatsapp.com/example/**x**' }
		]
	},
	canada: {
		name: 'Canada',
		links: [{ label: 'Events', url: 'https://luma.com/calendar/cal-tsYv79s4aTQC16Q' }]
	},
	germany: { name: 'Germany', links: [{ label: 'Website', url: 'https://www.pause-ai.de' }] },
	'united kingdom': {
		name: 'United Kingdom',
		links: [{ label: 'Website', url: 'https://pauseai.uk' }]
	}
}

const { reportError } = vi.hoisted(() => ({ reportError: vi.fn() }))
vi.mock('$lib/server/sentry', () => ({ reportError }))

vi.mock('./chapter.js', () => ({
	getChapterForOnboardingEmail: (country: string | undefined) =>
		Promise.resolve(CHAPTERS[(country ?? '').trim().toLowerCase()] ?? null)
}))

const { chapterShareFromRequest, renderOnboardingEmail } = await import('./index.js')

const RECORD_ID = 'recTest1234567890'
const INTENTS = ['None', 'Keep informed', 'Act now', 'Volunteer', 'Lead', '', 'Something new']
const COUNTRIES = [
	'',
	'Netherlands',
	'Belgium',
	'Spain',
	'Mexico',
	'United Kingdom',
	'United States',
	'Sweden',
	'Germany'
]
// The promise of an occasional message whatever they opted in to, in each language it is made in.
const ALERT_PROMISE =
	/critical alert|alerta crítica|viktigt och brådskande meddelande|viktiga meddelanden|In dringenden Fällen/

const BASE = { firstName: 'Alex', airtable_id: RECORD_ID, chapterShare: true }

function render(country: string, intent: string, options: Partial<OnboardingEmailParams> = {}) {
	return renderOnboardingEmail({ ...BASE, country, intent, ...options })
}

function renderSpeaking(country: string, intent: string, languages: string[]) {
	return renderOnboardingEmail({ ...BASE, country, intent, languages })
}

function renderSubscribed(country: string, intent: string, subscribed: boolean | undefined) {
	return renderOnboardingEmail({ ...BASE, country, intent, subscribed })
}

describe('renderOnboardingEmail', () => {
	// The live script falls back to a template when the link is missing, so a regression here
	// would not strand anyone, but it would silently stop the composed path.
	it('always carries the verification link and the critical alert promise', async () => {
		for (const country of COUNTRIES) {
			for (const intent of INTENTS) {
				const email = await render(country, intent)
				const where = `${country || '(none)'} / ${intent || '(empty)'}`
				expect(email.html, where).toContain(`verificationKey=${RECORD_ID}`)
				expect(email.text, where).toContain(`verificationKey=${RECORD_ID}`)
				expect(email.text, where).toMatch(ALERT_PROMISE)
			}
		}
	})

	it('promises chapter contact to volunteers only', async () => {
		const volunteer = await render('Netherlands', 'Volunteer')
		expect(volunteer.text).toContain('PauseAI Netherlands will be in touch')
		expect(volunteer.text).toContain('https://chat.whatsapp.com/example')

		const nonVolunteer = await render('Netherlands', 'Act now')
		expect(nonVolunteer.text).not.toContain('will be in touch')
		expect(nonVolunteer.text).toContain("There's a PauseAI chapter in Netherlands.")
		expect(nonVolunteer.text).toContain('https://chat.whatsapp.com/example')

		const noChapter = await render('', 'Lead')
		expect(noChapter.text).toContain('Our onboarding team will be in touch.')
	})

	it('keeps the promise but drops the links row for a chapter with no links', async () => {
		expect((await render('Belgium', 'Volunteer')).text).toContain(
			'PauseAI Belgium will be in touch'
		)
		expect((await render('Belgium', 'None')).text).not.toContain('PauseAI chapter in')
	})

	// The whole point of the skeleton is that these two lines cannot go missing, and they are
	// worth as little in the wrong language as they would be missing.
	it('writes the fixed lines in the language of the email around them', async () => {
		const english = await render('', 'None')
		expect(english.text).toContain('To confirm your email address')
		expect(english.text).not.toContain('alerta crítica')

		const spanish = await render('Mexico', 'Volunteer')
		expect(spanish.text).toContain('haz clic en')
		expect(spanish.text).toContain('alerta crítica')
		expect(spanish.text).not.toContain('critical alert')
	})

	it('leaves a chapter link alone when it carries markdown of its own', async () => {
		const email = await render('Sweden', 'Volunteer')
		expect(email.html).toContain('href="https://chat.whatsapp.com/example/**x**"')
	})

	it('keeps a chapter its own email when the signup also speaks Spanish', async () => {
		const email = await renderSpeaking('United Kingdom', 'Volunteer', ['English', 'Spanish'])
		expect(email.subject).toBe('Welcome to PauseAI UK Alex!')
		expect(email.text).toContain('F0nj2RjLNeB1P1hyoDFsTz')
	})

	it('says less about the newsletter inside an email a chapter wrote', async () => {
		expect((await render('United Kingdom', 'Volunteer')).text).toContain(
			"If you opted in, we'll keep you posted."
		)
		expect((await render('', 'Volunteer')).text).toContain('the PauseAI monthly update')
	})

	it('states the shared newsletter promise instead of hedging once subscribed status is known', async () => {
		const subscribedShared = await renderSubscribed('', 'Volunteer', true)
		expect(subscribedShared.text).toContain("You'll receive the PauseAI monthly update")
		expect(subscribedShared.text).not.toContain('If you opted in')

		const notSubscribedShared = await renderSubscribed('', 'Volunteer', false)
		expect(notSubscribedShared.text).toContain("You didn't opt in to our newsletter")
		expect(notSubscribedShared.text).not.toContain('If you opted in')
	})

	it("gives a chapter's own email one newsletter line, whatever the signup chose", async () => {
		for (const subscribed of [true, false, undefined]) {
			const uk = await renderSubscribed('United Kingdom', 'Volunteer', subscribed)
			expect(uk.text).toContain("If you opted in, we'll keep you posted.")
			const sweden = await renderSubscribed('Sweden', 'Volunteer', subscribed)
			expect(sweden.text).toContain('Om du har valt att prenumerera håller vi dig uppdaterad.')
		}
	})

	it('treats every Spanish-speaking country alike', async () => {
		for (const country of ['Spain', 'Mexico']) {
			const volunteer = await render(country, 'Volunteer')
			expect(volunteer.subject).toContain('Bienvenido')
			expect(volunteer.text).not.toContain('PauseAI Spain')
			const none = await render(country, 'None')
			expect(none.subject).toContain('Bienvenido')
			expect(none.text).not.toContain('PauseAI chapter in')
			expect(none.text).toContain('Si te suscribiste a nuestra lista de correo')
			expect(none.text).not.toContain('Primeros pasos')
			const actNow = await render(country, 'Act now')
			expect(actNow.subject).toContain('Bienvenido')
			expect(actNow.text).toContain('Si estás buscando un paso a seguir ahora mismo')
			expect(actNow.text).toContain('https://pauseai.info/action')
		}
	})

	it('gives the no-intent copy to anything that is not Act now, Volunteer or Lead', async () => {
		for (const intent of ['None', 'Keep informed', '', 'Something new']) {
			expect((await render('', intent)).subject).toBe('Thanks for signing up to PauseAI')
		}
		expect((await render('', 'Act now')).subject).toBe('Thanks for taking action with PauseAI')
	})

	it('uses the UK override for every UK signup, one for volunteers and one for the rest', async () => {
		for (const intent of ['None', 'Act now', 'Volunteer']) {
			const email = await render('United Kingdom', intent)
			expect(email.subject).toBe('Welcome to PauseAI UK Alex!')
			expect(email.text).toContain('F0nj2RjLNeB1P1hyoDFsTz')
			expect(email.text).toContain('Mass lobby day in Parliament')
			expect(email.text).toContain('PS: if you have questions')
		}
		// Volunteers are asked to join WhatsApp up front; everyone else hears of it in the footer.
		const volunteer = await render('United Kingdom', 'Volunteer')
		expect(volunteer.text).toContain('find your local group chat')
		const nonVolunteer = await render('United Kingdom', 'None')
		expect(nonVolunteer.text).not.toContain('find your local group chat')
		expect(nonVolunteer.text).toContain('protect yourself and your loved ones')
	})

	it('keeps a two-line list item on two lines, without bold markers in the text', async () => {
		const email = await render('United Kingdom', 'Volunteer')
		expect(email.html).toContain('<br><a href="https://luma.com/pauseai-nov26?tk=UEvEYj"')
		expect(email.text).toContain(
			'3. Saturday 21st November: March Against AI Extinction. We are putting on'
		)
		expect(email.text).toContain('\nJoseph Miller\nDirector of PauseAI UK')
	})

	it('gives Canada its own volunteer email but the shared copy otherwise', async () => {
		const volunteer = await render('Canada', 'Volunteer')
		expect(volunteer.subject).toBe('Welcome to PauseAI Canada Alex!')
		expect(volunteer.text).toContain('monthly video call')

		const nonVolunteer = await render('Canada', 'Act now')
		expect(nonVolunteer.subject).toBe('Thanks for taking action with PauseAI')
	})

	it('sends PauseAI Sverige their own email, in Swedish, one per intent', async () => {
		for (const intent of ['Volunteer', 'Lead']) {
			const volunteer = await render('Sweden', intent)
			expect(volunteer.subject).toBe('PauseAI Sverige - Volontär/lead inom PauseAI')
			expect(volunteer.text).toContain('Bekräfta din e-postadress')
			expect(volunteer.text).toContain('Catalyse')
			expect(volunteer.text).toContain('Vänliga hälsningar')
		}

		const actNow = await render('Sweden', 'Act now')
		expect(actNow.subject).toBe('PauseAI Sverige - Så här kan du engagera dig för AI-säkerhet')
		expect(actNow.text).toContain('Ta nästa steg')
		expect(actNow.text).not.toContain('Catalyse')
	})

	it('renders italics and a sub-bullet, and leaves no markers in the plain text', async () => {
		const email = await render('Sweden', 'Act now')
		expect(email.html).toContain('<em>Vänliga hälsningar</em>')
		expect(email.html).toContain('<strong>mejlbyggare</strong>')
		expect(email.html).toMatch(/personliga mejl\.<ul[^>]*><li[^>]*>Vår Mejlbyggare/)
		expect(email.text).toContain('för att skapa personliga mejl.\n  - Vår Mejlbyggare')
		expect(email.text).toContain('\nVänliga hälsningar\n')
		expect(email.text).not.toContain('*')
	})

	it('gives Swedish signups with no intent their own email, with its own newsletter line', async () => {
		const email = await render('Sweden', 'None')
		expect(email.subject).toBe('Tack för att du har registrerat dig hos PauseAI')
		expect(email.text).toContain('Bekräfta din e-postadress')
		expect(email.text).toContain('Oavsett kommer vi ibland skicka viktiga meddelanden till dig.')
		expect(email.text).not.toContain('Om du har valt att prenumerera')
		expect(email.html).toContain('href="https://chat.whatsapp.com/example/**x**"')
	})

	it('drops a Swedish sentence whose link the chapter row lacks', async () => {
		const email = await render('Sweden', 'Act now')
		expect(email.text).toContain('Whatsapp community')
		expect(email.text).not.toContain('Kalendern')
	})

	it('sends PauseAI Deutschland their own email, in German, one per intent', async () => {
		const none = await render('Germany', 'None')
		expect(none.text).toContain('Wenn Du aktiv werden willst')
		const actNow = await render('Germany', 'Act now')
		expect(actNow.text).toContain('Sofort loslegen')
		const volunteers = [await render('Germany', 'Volunteer'), await render('Germany', 'Lead')]
		for (const volunteer of volunteers) {
			expect(volunteer.text).toContain('Nächster Schritt: Call zum Kennenlernen')
			expect(volunteer.text).toContain('Auf eigene Faust')
		}
		for (const email of [none, actNow, ...volunteers]) {
			expect(email.subject).toBe('Willkommen bei PauseAI Deutschland, Alex!')
			expect(email.html).toContain('<html lang="de">')
			expect(email.text).toContain('In dringenden Fällen schreiben wir Dir auch ohne Newsletter.')
			expect(email.text).toContain('kannst Du diese Mail ignorieren.')
			expect(email.text).not.toMatch(/critical alert|If you opted in/)
		}
	})

	it('puts the German verification link on a button under the confirm line', async () => {
		const email = await render('Germany', 'Act now')
		expect(email.text).toMatch(
			new RegExp(
				`Bitte bestätige zuerst Deine E-Mail-Adresse:\\s+\\[E-MAIL BESTÄTIGEN\\]\\(\\S+verificationKey=${RECORD_ID}\\)`
			)
		)
		expect(email.html).toMatch(
			new RegExp(`verificationKey=${RECORD_ID}"[^>]*>E-MAIL BESTÄTIGEN</a>`)
		)
	})

	it("does not let a signup's name render as a link", async () => {
		const email = await render('', 'None', { firstName: '[Verify here](https://example.com)' })
		expect(email.html).not.toContain('href="https://example.com"')
	})

	describe('for a signup who did not agree to chapter sharing', () => {
		const GLOBAL_SENDER = { email: 'info@pauseai.info', name: 'PauseAI' }
		const CHAPTER_EMAILS = [
			['United Kingdom', 'None', 'Welcome to PauseAI UK Alex!'],
			['United Kingdom', 'Volunteer', 'Welcome to PauseAI UK Alex!'],
			['Canada', 'Volunteer', 'Welcome to PauseAI Canada Alex!'],
			['Germany', 'None', 'Willkommen bei PauseAI Deutschland, Alex!'],
			['Germany', 'Volunteer', 'Willkommen bei PauseAI Deutschland, Alex!'],
			['Sweden', 'None', 'Tack för att du har registrerat dig hos PauseAI'],
			['Sweden', 'Volunteer', 'PauseAI Sverige - Volontär/lead inom PauseAI']
		]

		it("gives the shared copy from PauseAI Global instead of a chapter's own email", async () => {
			for (const [country, intent, chapterSubject] of CHAPTER_EMAILS) {
				const where = `${country} / ${intent}`
				const shared = await render(country, intent)
				expect(shared.subject, where).toBe(chapterSubject)

				const declined = await render(country, intent, { chapterShare: false })
				expect(declined.subject, where).toBe(
					intent === 'Volunteer' ? 'Welcome to PauseAI, Alex!' : 'Thanks for signing up to PauseAI'
				)
				expect(declined.from, where).toEqual(GLOBAL_SENDER)
				expect(declined.text, where).toContain('Maxime and The PauseAI Global Team')
			}
		})

		it('says the onboarding team will be in touch, not the chapter', async () => {
			for (const country of ['United Kingdom', 'Canada', 'Germany', 'Netherlands', 'Belgium']) {
				const declined = await render(country, 'Volunteer', { chapterShare: false })
				expect(declined.text, country).toContain('Our onboarding team will be in touch.')
				expect(declined.text, country).not.toContain('will be in touch to invite you')
			}
			// The chapter's public links promise nothing, so they stay.
			const netherlands = await render('Netherlands', 'Volunteer', { chapterShare: false })
			expect(netherlands.text).toContain("There's a PauseAI chapter in Netherlands.")
			expect(netherlands.text).toContain('https://chat.whatsapp.com/example')

			expect((await render('Netherlands', 'Volunteer')).text).toContain(
				'PauseAI Netherlands will be in touch'
			)
		})

		// The public chapter links promise no contact, and the Spanish email names no chapter.
		it('changes nothing but the sender where the email promises no chapter contact', async () => {
			const cases: [string, string, Partial<OnboardingEmailParams>?][] = [
				['Netherlands', 'Act now'],
				['Canada', 'Act now'],
				['', 'None'],
				['', 'Act now'],
				['', 'Volunteer'],
				['Mexico', 'Volunteer', { languages: ['Spanish'] }]
			]
			for (const [country, intent, options] of cases) {
				const where = `${country || '(none)'} / ${intent}`
				const shared = await render(country, intent, options)
				const declined = await render(country, intent, { ...options, chapterShare: false })
				expect(declined.from, where).toEqual(GLOBAL_SENDER)
				expect({ ...declined, from: undefined }, where).toEqual(shared)
			}
		})
	})

	// The endpoint returns the rendered email as it is, so an extra key would change the JSON the
	// Airtable script reads for every signup who agreed.
	it('returns only the email for a signup who agreed to chapter sharing', async () => {
		for (const country of COUNTRIES) {
			for (const intent of INTENTS) {
				expect(Object.keys(await render(country, intent)).sort()).toEqual([
					'html',
					'subject',
					'text'
				])
			}
		}
	})
})

describe('chapterShareFromRequest', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		reportError.mockClear()
	})

	it('takes only true as agreement', async () => {
		expect(await chapterShareFromRequest({ gdpr_chapter_share: true })).toBe(true)
		for (const value of [false, null, undefined, 'true', 1, [true]]) {
			expect(await chapterShareFromRequest({ gdpr_chapter_share: value }), String(value)).toBe(
				false
			)
		}
	})

	it('reports a request that does not carry the key at all, without its values', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		const body = { first_name: 'Alex', airtable_id: RECORD_ID, country: 'United Kingdom' }
		expect(await chapterShareFromRequest(body)).toBe(false)
		expect(reportError).toHaveBeenCalledTimes(1)
		const payload = JSON.stringify(reportError.mock.calls[0], (_key, value: unknown) =>
			value instanceof Error ? value.message : value
		)
		expect(payload).toContain('gdpr_chapter_share')
		for (const value of Object.values(body)) expect(payload).not.toContain(value)

		reportError.mockClear()
		await chapterShareFromRequest({ gdpr_chapter_share: false })
		await chapterShareFromRequest({ gdpr_chapter_share: null })
		expect(reportError).not.toHaveBeenCalled()
	})
})
