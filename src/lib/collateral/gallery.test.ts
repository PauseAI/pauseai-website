import { describe, expect, it, vi } from 'vitest'
import { tintVisible } from './design'
import { LIBRARY_PHOTOS } from './photos'
import { DEFAULT_THEME_ID } from './themes'
import {
	DEFAULT_SLIDE_PHOTO_SETTINGS,
	EXAMPLE_SLIDE,
	SLIDE_PHOTO_VISIBLE,
	newSlide,
	newSlideId
} from './gallery'

describe('gallery slides', () => {
	it('shows the photo at the medium colour strength', () => {
		expect(SLIDE_PHOTO_VISIBLE).toBe(tintVisible('medium'))
		expect(DEFAULT_SLIDE_PHOTO_SETTINGS).toEqual({
			zoom: 1,
			focalX: 0.5,
			focalY: 0.5,
			visible: SLIDE_PHOTO_VISIBLE
		})
	})

	it('gives every slide a different id, even within one millisecond', () => {
		vi.spyOn(Date, 'now').mockReturnValue(1234)
		const ids = [newSlideId(), newSlideId(), newSlideId()]
		vi.restoreAllMocks()
		expect(new Set(ids).size).toBe(3)
		expect(ids[0]).toMatch(/^slide-1234-\d+$/)
	})

	it('starts a new slide empty, in the default style, with its own photo settings', () => {
		const a = newSlide()
		const b = newSlide()
		expect(a).toMatchObject({
			photo: null,
			caption: '',
			themeId: DEFAULT_THEME_ID,
			photoSettings: DEFAULT_SLIDE_PHOTO_SETTINGS
		})
		expect(a.id).not.toBe(b.id)
		a.photoSettings.zoom = 2
		expect(b.photoSettings.zoom).toBe(1)
		expect(DEFAULT_SLIDE_PHOTO_SETTINGS.zoom).toBe(1)
	})

	it('has an example caption, on a photo from the library', () => {
		expect(EXAMPLE_SLIDE.caption.length).toBeGreaterThan(0)
		expect(LIBRARY_PHOTOS.map((p) => p.id)).toContain(EXAMPLE_SLIDE.photoId)
	})
})
