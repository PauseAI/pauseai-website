import { describe, expect, it } from 'vitest'
import {
	chapterName,
	chapterQuestion,
	chapterShareWording,
	effectiveAnswer,
	inTouch,
	keepInformedSub
} from './chapterShare.js'
import { onboardingMessages } from './messages.js'

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
			for (const form of ['join', 'subscribe'] as const) {
				const withChapter = chapterQuestion(msgs, form, 'Germany', 'PauseAI Deutschland')!
				expect(withChapter.heading, locale).toContain('PauseAI Deutschland')
				expect(withChapter.yes, locale).toContain('PauseAI Deutschland')
				const without = chapterQuestion(msgs, form, 'Portugal', null)!
				expect(without.heading, locale).toContain('Portugal')
				expect(without.body, locale).toContain('Portugal')
			}
		}
		expect(onboardingMessages.de.onboarding_chapter_no).toBe('Nein, nur PauseAI Global')
	})

	it('asks about a future chapter where the country has none', () => {
		const question = chapterQuestion(en, 'join', 'Portugal', chapterName('Portugal', ['Germany']))
		expect(question?.heading).toBe(
			'Share your details with a PauseAI chapter in Portugal when one starts?'
		)
		expect(question?.yes).toBe('Yes, share my details with the chapter when it starts')
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
		expect(inTouch(en, null, 'PauseAI Germany')).toBe("We'll be in touch by email.")
		expect(inTouch(en, 'yes', 'PauseAI Germany')).toBe('PauseAI Germany will be in touch by email.')
		expect(inTouch(en, 'yes', null)).toBe(
			'PauseAI Global will be in touch by email, and your chapter will be too once one starts.'
		)
		expect(inTouch(en, 'no', 'PauseAI Germany')).toBe('PauseAI Global will be in touch by email.')
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
