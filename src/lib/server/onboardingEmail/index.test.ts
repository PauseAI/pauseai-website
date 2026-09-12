import { describe, expect, it, vi } from 'vitest'
import type { ChapterBlockData } from './types.js'

// Stands in for the live National Groups table: one chapter with links, one without.
const CHAPTERS: Record<string, ChapterBlockData> = {
	germany: {
		name: 'Germany',
		links: [{ label: 'WhatsApp', url: 'https://chat.whatsapp.com/example' }]
	},
	belgium: { name: 'Belgium', links: [] },
	spain: { name: 'Spain', links: [{ label: 'Website', url: 'https://pauseai.es' }] },
	sweden: { name: 'Sweden', links: [{ label: 'Website', url: 'https://pauseai.se/' }] },
	// The chapters whose own emails draw their links from these rows.
	'united kingdom': {
		name: 'United Kingdom',
		links: [
			// Carries markdown of its own: a row value is free text, and the UK's email splices
			// it into a sentence rather than rendering it as a bare link.
			{ label: 'WhatsApp', url: 'https://chat.whatsapp.com/F0nj2RjLNeB1P1hyoDFsTz/**x**' },
			{ label: 'Events', url: 'https://lu.ma/pauseai.uk' }
		]
	},
	canada: {
		name: 'Canada',
		links: [{ label: 'Events', url: 'https://luma.com/calendar/cal-tsYv79s4aTQC16Q' }]
	}
}

vi.mock('./chapter.js', () => ({
	getChapterForOnboardingEmail: (country: string | undefined) =>
		Promise.resolve(CHAPTERS[(country ?? '').trim().toLowerCase()] ?? null)
}))

const { renderOnboardingEmail } = await import('./index.js')

const RECORD_ID = 'recTest1234567890'
const INTENTS = ['None', 'Keep informed', 'Act now', 'Volunteer', 'Lead', '', 'Something new']
const COUNTRIES = ['', 'Germany', 'Belgium', 'Spain', 'Mexico', 'United Kingdom', 'United States']

function render(country: string, intent: string, firstName = 'Alex') {
	return renderOnboardingEmail({ firstName, country, intent, airtable_id: RECORD_ID })
}

function renderSpeaking(country: string, intent: string, languages: string[]) {
	return renderOnboardingEmail({
		firstName: 'Alex',
		country,
		intent,
		languages,
		airtable_id: RECORD_ID
	})
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
				expect(email.text, where).toMatch(/critical alert|alerta crítica/)
			}
		}
	})

	it('promises chapter contact to volunteers only', async () => {
		const volunteer = await render('Germany', 'Volunteer')
		expect(volunteer.text).toContain('PauseAI Germany will be in touch')
		expect(volunteer.text).toContain('https://chat.whatsapp.com/example')

		const nonVolunteer = await render('Germany', 'Act now')
		expect(nonVolunteer.text).not.toContain('will be in touch')
		expect(nonVolunteer.text).toContain("There's a PauseAI chapter in Germany.")
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
		const email = await render('United Kingdom', 'Volunteer')
		expect(email.html).toContain('href="https://chat.whatsapp.com/F0nj2RjLNeB1P1hyoDFsTz/**x**"')
	})

	it('keeps a chapter its own email and its own links when the signup also speaks Spanish', async () => {
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

	it('treats every Spanish-speaking country alike', async () => {
		for (const country of ['Spain', 'Mexico']) {
			const volunteer = await render(country, 'Volunteer')
			expect(volunteer.subject).toContain('Bienvenido')
			expect(volunteer.text).not.toContain('PauseAI Spain')
			const nonVolunteer = await render(country, 'None')
			expect(nonVolunteer.subject).toBe('Thanks for signing up to PauseAI')
			expect(nonVolunteer.text).not.toContain('PauseAI chapter in')
		}
	})

	it('gives the no-intent copy to anything that is not Act now, Volunteer or Lead', async () => {
		for (const intent of ['None', 'Keep informed', '', 'Something new']) {
			expect((await render('', intent)).subject).toBe('Thanks for signing up to PauseAI')
		}
		expect((await render('', 'Act now')).subject).toBe('Thanks for taking action with PauseAI')
	})

	it('uses the UK override for every UK signup, one version per group', async () => {
		for (const intent of ['None', 'Volunteer']) {
			const email = await render('United Kingdom', intent)
			expect(email.subject).toBe('Welcome to PauseAI UK Alex!')
			expect(email.text).toContain('F0nj2RjLNeB1P1hyoDFsTz')
		}
		expect((await render('United Kingdom', 'Volunteer')).text).toContain('book a 10 minute call')
		expect((await render('United Kingdom', 'None')).text).toContain('PS: if you have questions')
	})

	it('gives Canada its own volunteer email but the shared copy otherwise', async () => {
		const volunteer = await render('Canada', 'Volunteer')
		expect(volunteer.subject).toBe('Welcome to PauseAI Canada Alex!')
		expect(volunteer.text).toContain('monthly video call')

		const nonVolunteer = await render('Canada', 'Act now')
		expect(nonVolunteer.subject).toBe('Thanks for taking action with PauseAI')
	})

	it('sends PauseAI Sverige their own email, in Swedish', async () => {
		const email = await render('Sweden', 'Volunteer')
		expect(email.subject).toBe('Välkommen till PauseAI Sverige, Alex!')
		expect(email.text).toContain('Bekräfta din e-postadress')
		expect(email.text).toContain('Mvh')
	})

	it("does not let a signup's name render as a link", async () => {
		const email = await render('', 'None', '[Verify here](https://example.com)')
		expect(email.html).not.toContain('href="https://example.com"')
	})
})
