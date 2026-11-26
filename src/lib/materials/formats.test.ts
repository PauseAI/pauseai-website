import { describe, expect, it } from 'vitest'
import {
	aspectClass,
	BLEED_MM,
	FORMATS,
	getFormat,
	MAX_CANVAS_PIXELS,
	mmToPx,
	renderSize,
	showsQrCodes
} from './formats'

describe('formats', () => {
	it('has unique ids', () => {
		const ids = FORMATS.map((f) => f.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('falls back to the default format for unknown ids', () => {
		expect(getFormat('nope').id).toBe('ig-square')
	})

	it('uses exact pixel sizes for digital formats', () => {
		expect(renderSize(getFormat('story'))).toEqual({ width: 1080, height: 1920, bleedPx: 0 })
		expect(renderSize(getFormat('luma-cover'))).toEqual({ width: 1080, height: 1080, bleedPx: 0 })
	})

	it('leaves QR codes off social posts unless asked, off the Luma cover always, and on print and slides', () => {
		expect(showsQrCodes(getFormat('ig-square'), false)).toBe(false)
		expect(showsQrCodes(getFormat('ig-square'), true)).toBe(true)
		expect(showsQrCodes(getFormat('luma-cover'), true)).toBe(false)
		expect(showsQrCodes(getFormat('a5'), false)).toBe(true)
		expect(showsQrCodes(getFormat('slide'), false)).toBe(true)
	})

	it('renders A5 at 300 dpi', () => {
		const size = renderSize(getFormat('a5'))
		expect(size.width).toBe(1748)
		expect(size.height).toBe(2480)
		expect(size.dpi).toBe(300)
		expect(size.bleedPx).toBe(0)
	})

	it('adds 3mm bleed on every edge when asked', () => {
		const trim = renderSize(getFormat('a5'))
		const bleed = renderSize(getFormat('a5'), { bleed: true })
		expect(bleed.bleedPx).toBe(mmToPx(BLEED_MM, 300))
		expect(bleed.width).toBe(mmToPx(148 + BLEED_MM * 2, 300))
		expect(bleed.width - trim.width).toBeGreaterThanOrEqual(bleed.bleedPx * 2 - 1)
	})

	it('keeps every print render under the mobile canvas limit', () => {
		for (const format of FORMATS.filter((f) => f.kind === 'print')) {
			for (const bleed of [false, true]) {
				const { width, height } = renderSize(format, { bleed })
				expect(width * height).toBeLessThanOrEqual(MAX_CANVAS_PIXELS)
			}
		}
	})

	it('drops A3 below 300 dpi to stay under the limit', () => {
		expect(renderSize(getFormat('a3'), { bleed: true }).dpi).toBeLessThan(300)
	})
})

describe('aspectClass', () => {
	it('classifies the standard shapes', () => {
		expect(aspectClass(1080, 1080)).toBe('square')
		expect(aspectClass(1080, 1350)).toBe('portrait')
		expect(aspectClass(1080, 1920)).toBe('story')
		expect(aspectClass(1600, 900)).toBe('landscape')
		expect(aspectClass(1500, 500)).toBe('banner')
		expect(aspectClass(1748, 2480)).toBe('portrait')
	})
})
