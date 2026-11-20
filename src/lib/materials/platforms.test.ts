import { describe, expect, it } from 'vitest'
import { ALL_PLATFORM_IDS, CAROUSEL_PLATFORMS, getCarouselVariant } from './platforms'
import { FORMATS } from './formats'

describe('carousel platforms', () => {
	it('lists every platform once', () => {
		expect(ALL_PLATFORM_IDS).toEqual(['instagram', 'linkedin', 'x'])
	})

	it("finds a platform's variant", () => {
		expect(getCarouselVariant('x').maxSlides).toBe(4)
		expect(getCarouselVariant('linkedin').export).toBe('both')
	})

	it('falls back to the first platform for an unknown id', () => {
		expect(getCarouselVariant('myspace' as never)).toBe(CAROUSEL_PLATFORMS[0])
	})

	it('only points at formats that exist', () => {
		const ids = new Set(FORMATS.map((f) => f.id))
		for (const variant of CAROUSEL_PLATFORMS) expect(ids.has(variant.formatId)).toBe(true)
	})
})
