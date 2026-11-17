import { describe, expect, it } from 'vitest'
import { CHAPTER_CHOICES, CHAPTERS, getChapter, GLOBAL_CHAPTER } from './chapters'
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
