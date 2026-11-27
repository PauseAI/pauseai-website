import { describe, expect, it } from 'vitest'
import {
	chapterName,
	chapterQuestion,
	chapterShareWording,
	effectiveAnswer,
	inTouch,
	keepInformedSub,
	possibleWordings
} from './chapterShare.js'
import { onboardingMessages, retiredChapterWordings } from './messages.js'

const en = onboardingMessages.en

describe('chapterQuestion', () => {
	it('names the chapter where the country has one', () => {
		expect(chapterName('France', ['Germany', 'france'])).toBe('PauseAI France')
		expect(chapterName('Portugal', ['Germany', 'France'])).toBeNull()
		const question = chapterQuestion(en, 'join', 'Germany', 'PauseAI Germany')
		expect(question).toEqual({
			heading: 'Share your details with PauseAI Germany?',
			body: 'If you say yes, we share your signup details with PauseAI Germany, which may be a separate organisation from PauseAI Global. You can change your mind at any time by emailing privacy@pauseai.info.',
			yes: 'Yes, share my details with PauseAI Germany',
			no: 'No, only PauseAI Global'
		})
	})

	it("uses a chapter's own name where it is not PauseAI <country>", () => {
		const chapters = ['Germany', 'Sweden', 'United Kingdom']
		expect(chapterName('United Kingdom', chapters)).toBe('PauseAI UK')
		expect(chapterName('Germany', chapters)).toBe('PauseAI Deutschland')
		expect(chapterName('Sweden', chapters)).toBe('PauseAI Sverige')
	})

	it('renders in every locale, with the chapter and country filled in', () => {
		for (const [locale, msgs] of Object.entries(onboardingMessages)) {
			for (const form of ['join', 'subscribe', 'chapter-site'] as const) {
				const withChapter = chapterQuestion(msgs, form, 'Germany', 'PauseAI Deutschland')!
				expect(withChapter.yes, locale).toContain('PauseAI Deutschland')
				expect(withChapter.body, locale).toContain('PauseAI Deutschland')
				// chapter-site's checkbox has no heading.
				if (form !== 'chapter-site') {
					expect(withChapter.heading, locale).toContain('PauseAI Deutschland')
				}
				const without = chapterQuestion(msgs, form, 'Portugal', null)!
				expect(without.heading, locale).toContain('Portugal')
				expect(without.body, locale).toContain('Portugal')
			}
		}
		expect(onboardingMessages.de.onboarding_chapter_no).toBe('Nein, nur PauseAI Global')
		expect(onboardingMessages.it.onboarding_chapter_no).toBe('No, solo PauseAI Global')
	})

	it('asks about a future chapter where the country has none', () => {
		const question = chapterQuestion(en, 'join', 'Portugal', chapterName('Portugal', ['Germany']))
		expect(question?.heading).toBe(
			'Share your details with a PauseAI chapter in Portugal when one starts?'
		)
		expect(question?.yes).toBe('Yes, share my details with the chapter when it starts')
	})

	it('uses the chapter-site variant: a single checkbox with a line under it, no heading', () => {
		const question = chapterQuestion(en, 'chapter-site', 'Germany', 'PauseAI Germany')!
		expect(question).toMatchObject({
			heading: '',
			body: "PauseAI Germany's organisers will use your details to coordinate PauseAI's local activities. PauseAI Germany may be a separate organisation from PauseAI Global. You can change your mind at any time by emailing privacy@pauseai.info.",
			yes: 'Share my details with PauseAI Germany',
			no: 'No, only PauseAI Global'
		})
		// No blank line for the empty heading.
		expect(chapterShareWording(question, 'yes')).toBe(
			"PauseAI Germany's organisers will use your details to coordinate PauseAI's local activities. PauseAI Germany may be a separate organisation from PauseAI Global. You can change your mind at any time by emailing privacy@pauseai.info.\n[chosen] Share my details with PauseAI Germany"
		)
	})

	it('links the Privacy Policy and /join under the chapter-site checkbox, in a new tab', () => {
		for (const [locale, msgs] of Object.entries(onboardingMessages)) {
			const line = msgs.onboarding_chapter_site_alternative('PauseAI UK')
			expect(line, locale).toContain('PauseAI UK')
			for (const href of ['/privacy', '/join']) {
				expect(line, locale).toContain(
					`<a target="_blank" rel="noopener noreferrer" href="${href}">`
				)
			}
		}
		expect(en.onboarding_chapter_site_alternative('PauseAI UK')).toBe(
			'<a target="_blank" rel="noopener noreferrer" href="/privacy">Privacy Policy</a> · Don\'t want PauseAI UK to see your details? <a target="_blank" rel="noopener noreferrer" href="/join">Join PauseAI Global only</a>.'
		)
	})

	it("uses /subscribe's variant, whose Yes covers email", () => {
		expect(chapterQuestion(en, 'subscribe', 'Germany', 'PauseAI Germany')).toMatchObject({
			heading: 'Hear from PauseAI Germany too?',
			yes: 'Yes, share my details with PauseAI Germany so it can email me local news'
		})
	})

	it('is not asked in the United States, whose copy reads as not shared', () => {
		expect(chapterQuestion(en, 'join', 'United States', null)).toBeNull()
		expect(effectiveAnswer('United States', null)).toBe('no')
		expect(effectiveAnswer('Portugal', null)).toBeNull()
	})
})

describe('possibleWordings', () => {
	it("accepts the chapter-site checkbox's current and retired wordings, in every locale", () => {
		const offered = possibleWordings(['join', 'chapter-site'], 'United Kingdom', 'yes')
		for (const [locale, msgs] of Object.entries(onboardingMessages)) {
			const question = chapterQuestion(msgs, 'chapter-site', 'United Kingdom', 'PauseAI UK')!
			expect(offered, locale).toContain(chapterShareWording(question, 'yes'))
			const retiredForLocale = retiredChapterWordings[locale]?.['chapter-site'] ?? []
			// Every locale shipped the earlier label, so each must keep one.
			expect(retiredForLocale.length, locale).toBeGreaterThan(0)
			for (const retired of retiredForLocale) {
				expect(offered, locale).toContain(
					chapterShareWording({ ...retired('PauseAI UK'), no: question.no }, 'yes')
				)
			}
		}
		expect(offered).toContain('[chosen] Share my details with PauseAI UK and PauseAI Global')
		// The checkbox can't post a No, so no chapter-site wording is accepted with one.
		const offeredNo = possibleWordings(['join', 'chapter-site'], 'United Kingdom', 'no')
		expect(offeredNo).not.toContain('[chosen] No, only PauseAI Global')
		expect(offeredNo).not.toContain(
			chapterShareWording(
				chapterQuestion(en, 'chapter-site', 'United Kingdom', 'PauseAI UK')!,
				'no'
			)
		)
		// Retired labels belong to the chapter-site form only.
		expect(possibleWordings(['join'], 'United Kingdom', 'yes')).not.toContain(
			'[chosen] Share my details with PauseAI UK and PauseAI Global'
		)
	})
})

describe('chapterShareWording', () => {
	it('stores the heading, the explanation and the option picked', () => {
		const question = chapterQuestion(en, 'join', 'Germany', 'PauseAI Germany')!
		expect(chapterShareWording(question, 'no')).toBe(
			`${question.heading}\n${question.body}\n[chosen] No, only PauseAI Global`
		)
		expect(chapterShareWording(question, 'yes')).toMatch(
			/\n\[chosen\] Yes, share my details with PauseAI Germany$/
		)
	})
})

describe('copy that follows the answer', () => {
	it('says who will be in touch', () => {
		expect(inTouch(en, null, 'PauseAI Germany')).toBe("We'll email you about it.")
		expect(inTouch(en, 'yes', 'PauseAI Germany')).toBe('PauseAI Germany will email you about it.')
		expect(inTouch(en, 'yes', null)).toBe(
			'PauseAI Global will email you about it, and your chapter will too once one starts.'
		)
		expect(inTouch(en, 'no', 'PauseAI Germany')).toBe('PauseAI Global will email you about it.')
	})

	it('says what Keep me informed brings', () => {
		expect(keepInformedSub(en, 'yes', 'PauseAI Germany')).toBe(
			'Global campaign updates, plus news and ways to help from PauseAI Germany.'
		)
		expect(keepInformedSub(en, 'no', 'PauseAI Germany')).toBe(
			'Global campaign updates and ways to help.'
		)
	})
})
