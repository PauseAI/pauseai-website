import { describe, expect, it } from 'vitest'
import { designCountry, designValues, newDesign, withChapter } from './designState'

describe('withChapter', () => {
	it("switches untouched defaults to the new chapter's", () => {
		const uk = withChapter(newDesign(), 'United Kingdom')
		expect(designCountry(uk)).toBe('UK')
		expect(designValues(uk)).toMatchObject({ cta: 'Join PauseAI UK', url: 'pauseai.uk' })
	})

	it('keeps text the volunteer typed, and changes text still at the old default', () => {
		const typed = {
			...newDesign(),
			valuesByTemplate: {
				announcement: { ...designValues(newDesign()), cta: 'Come along' }
			}
		}
		const germany = withChapter(typed, 'Germany')
		expect(designValues(germany)).toMatchObject({ cta: 'Come along', url: 'pause-ai.de' })
		const back = withChapter(germany, '')
		expect(designCountry(back)).toBe('')
		expect(designValues(back)).toMatchObject({ cta: 'Come along', url: 'pauseai.info/join' })
	})
})
