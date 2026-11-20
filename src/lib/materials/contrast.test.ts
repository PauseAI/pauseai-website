import { describe, expect, it } from 'vitest'
import {
	busySample,
	contrastOf,
	hexToRgb,
	luminance,
	sampleContrast,
	worstFailure,
	type Backdrop,
	type Rgb,
	type TextSample
} from './contrast'

const INK: Rgb = [26, 22, 18]
const WHITE: Rgb = [255, 255, 255]
const ORANGE: Rgb = [255, 148, 22]

/** A 10×10 backdrop filled by `pick(x, y)`. */
function backdrop(pick: (x: number, y: number) => Rgb): Backdrop {
	const pixels = new Uint8ClampedArray(10 * 10 * 4)
	for (let y = 0; y < 10; y++) {
		for (let x = 0; x < 10; x++) {
			const [r, g, b] = pick(x, y)
			pixels.set([r, g, b, 255], (y * 10 + x) * 4)
		}
	}
	return { pixels, width: 10, height: 10 }
}

const whole = { x: 0, y: 0, w: 10, h: 10 }
const sample = (rgb: Rgb, large = false): TextSample => ({ text: 'Hello', rect: whole, rgb, large })

describe('colour maths', () => {
	it('matches the WCAG extremes', () => {
		expect(contrastOf(luminance([0, 0, 0]), luminance(WHITE))).toBeCloseTo(21, 0)
		expect(hexToRgb('#FF9416')).toEqual(ORANGE)
		expect(hexToRgb('rgba(0,0,0,0.5)')).toBeNull()
	})
})

describe('sampleContrast', () => {
	// The histogram reports contrast to within 0.02, rounding down, so compare to one decimal place.
	it('measures a plain photo like a plain colour', () => {
		const white = backdrop(() => WHITE)
		expect(sampleContrast(white, whole, INK, ORANGE, 1)!.low).toBeCloseTo(
			contrastOf(luminance(INK), luminance(WHITE)),
			1
		)
	})

	it('blends the style colour over the photo for tinted steps', () => {
		const black = backdrop(() => [0, 0, 0])
		// At 0 visible the photo is fully covered, so only the style colour counts.
		expect(sampleContrast(black, whole, INK, ORANGE, 0)!.low).toBeCloseTo(
			contrastOf(luminance(INK), luminance(ORANGE)),
			1
		)
	})

	it('judges by the worst tenth of pixels, so a small bright spot does not fail a line', () => {
		// Dark text: 5% white pixels pass through, 20% do not.
		const fewBright = backdrop((x, y) => (y * 10 + x < 5 ? [20, 20, 20] : WHITE))
		const manyDark = backdrop((x, y) => (y * 10 + x < 20 ? [20, 20, 20] : WHITE))
		expect(sampleContrast(fewBright, whole, INK, WHITE, 1)!.low).toBeGreaterThan(4.5)
		expect(sampleContrast(manyDark, whole, INK, WHITE, 1)!.low).toBeLessThan(1.5)
	})

	it('ignores boxes outside the backdrop', () => {
		expect(
			sampleContrast(
				backdrop(() => WHITE),
				{ x: 20, y: 20, w: 5, h: 5 },
				INK,
				WHITE,
				1
			)
		).toBeNull()
	})
})

describe('worstFailure', () => {
	const grey = backdrop(() => [110, 110, 110])

	it('holds normal text to 4.5:1 and large text to 3:1', () => {
		// Ink on mid-grey is about 3.9:1: fails for normal text, passes for large.
		expect(worstFailure(grey, [sample(INK)], WHITE, 1)?.required).toBe(4.5)
		expect(worstFailure(grey, [sample(INK, true)], WHITE, 1)).toBeNull()
	})

	it('passes once enough style colour is blended over', () => {
		expect(worstFailure(grey, [sample(INK)], ORANGE, 0.25)).toBeNull()
	})

	it('skips lines that sit off the photo', () => {
		const off = { ...sample(INK), rect: { x: 20, y: 20, w: 5, h: 5 } }
		expect(worstFailure(grey, [off], WHITE, 1)).toBeNull()
		expect(busySample(grey, [off], WHITE, 1)).toBeNull()
	})

	it('reports the line furthest short of its pass mark', () => {
		const dark = backdrop(() => [40, 40, 40])
		const bad = { ...sample(INK), text: 'Worse' }
		const lessBad = { ...sample(INK, true), text: 'Large' }
		// Ink on near-black fails both, but normal text is held to the higher mark, so it is further short.
		expect(worstFailure(dark, [lessBad, bad], WHITE, 1)?.sample.text).toBe('Worse')
		expect(worstFailure(dark, [bad, lessBad], WHITE, 1)?.sample.text).toBe('Worse')
	})

	it('counts a halo behind the text as extra style colour', () => {
		// Large orange text on the Black style over a light photo: about 2.7:1 bare, about 4.3:1 with the halo.
		const light = backdrop(() => [200, 200, 200])
		const bare = sample(ORANGE, true)
		expect(worstFailure(light, [bare], [0, 0, 0], 0.5)).not.toBeNull()
		expect(worstFailure(light, [{ ...bare, halo: 0.3 }], [0, 0, 0], 0.5)).toBeNull()
	})
})

describe('busySample', () => {
	it('flags small text on a high-contrast pattern, but not large text or a plain photo', () => {
		const stripes = backdrop((x) => (x % 2 ? WHITE : [0, 0, 0]))
		expect(busySample(stripes, [sample(INK)], WHITE, 1)).not.toBeNull()
		expect(busySample(stripes, [sample(INK, true)], WHITE, 1)).toBeNull()
		expect(
			busySample(
				backdrop(() => WHITE),
				[sample(INK)],
				WHITE,
				1
			)
		).toBeNull()
	})
})
