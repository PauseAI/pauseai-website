import { describe, expect, it } from 'vitest'
import {
	CHAPTER_CHOICES,
	CHAPTERS,
	chapterFieldDefaults,
	getChapter,
	GLOBAL_CHAPTER,
	printableLink
} from './chapters'
import { defaultValues, getTemplate } from './templates'
import { isQrLink } from './qr'

describe('chapters', () => {
	it('starts with PauseAI as a whole', () => {
		expect(CHAPTER_CHOICES[0]).toBe(GLOBAL_CHAPTER)
		expect(GLOBAL_CHAPTER.link).toBe('https://pauseai.info')
	})

	it('comes from the national chapters list, the UK among them', () => {
		expect(getChapter('United Kingdom').link).toBe('https://pauseai.uk/')
		expect(getChapter('Germany').label).toBe('Germany (Deutschland)')
	})

	it('falls back to PauseAI as a whole', () => {
		expect(getChapter('')).toBe(GLOBAL_CHAPTER)
		expect(getChapter('Atlantis')).toBe(GLOBAL_CHAPTER)
	})

	it('only has links a QR code can open', () => {
		for (const chapter of CHAPTERS) expect(isQrLink(chapter.link), chapter.link).toBe(true)
	})
})

describe('chapter field defaults', () => {
	it('points PauseAI as a whole at pauseai.info', () => {
		expect(chapterFieldDefaults(GLOBAL_CHAPTER, 'announcement')).toEqual({
			cta: 'Join PauseAI',
			url: 'pauseai.info/join'
		})
		expect(chapterFieldDefaults(GLOBAL_CHAPTER, 'event').url).toBe('pauseai.info/events')
	})

	it('keeps the UK as it was on pauseai.uk', () => {
		const uk = getChapter('United Kingdom')
		expect(uk.shortName).toBe('UK')
		expect(chapterFieldDefaults(uk, 'announcement')).toEqual({
			cta: 'Join PauseAI UK',
			url: 'pauseai.uk'
		})
		expect(chapterFieldDefaults(uk, 'quote').role).toBe('PauseAI UK volunteer')
	})

	it("uses a chapter's local name and its own site", () => {
		const germany = getChapter('Germany')
		expect(chapterFieldDefaults(germany, 'announcement')).toEqual({
			cta: 'Join PauseAI Deutschland',
			url: 'pause-ai.de'
		})
	})

	it('prints pauseai.info when the chapter link is a group chat', () => {
		expect(printableLink(getChapter('Netherlands'))).toBe('pauseai.info/join')
	})

	it('keeps every default within its field', () => {
		for (const chapter of CHAPTER_CHOICES) {
			for (const id of ['announcement', 'event', 'quote']) {
				const defaults = defaultValues(getTemplate(id), chapterFieldDefaults(chapter, id))
				for (const field of getTemplate(id).fields) {
					if (field.maxLength)
						expect(
							defaults[field.key].length,
							`${chapter.id} ${id} ${field.key}`
						).toBeLessThanOrEqual(field.maxLength)
				}
			}
		}
	})
})
