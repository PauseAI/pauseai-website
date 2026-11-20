import { describe, expect, it } from 'vitest'
import { MAX_ZOOM, panPhoto, zoomPhoto } from './photoTransform'
import { coverRect } from './text'

const img = { w: 2000, h: 1000 }
const box = { w: 500, h: 500 }
const centred = { zoom: 1, focalX: 0.5, focalY: 0.5 }

describe('panPhoto', () => {
	it('moves the image with the pointer', () => {
		const before = coverRect(img.w, img.h, box.w, box.h, 1, 0.5, 0.5)
		const view = panPhoto(img, box, centred, 40, 0)
		const after = coverRect(img.w, img.h, box.w, box.h, view.zoom, view.focalX, view.focalY)
		expect(after.x - before.x).toBeCloseTo(40, 5)
	})

	it('clamps at the edges so the photo always covers the frame', () => {
		expect(panPhoto(img, box, centred, 100000, 0).focalX).toBe(0)
		expect(panPhoto(img, box, centred, -100000, 0).focalX).toBe(1)
	})

	it('ignores movement on an axis with nothing to scroll', () => {
		// Image is wider than the box but exactly as tall, so vertical drag does nothing.
		expect(panPhoto(img, box, centred, 0, 50).focalY).toBe(0.5)
	})
})

describe('zoomPhoto', () => {
	it('keeps the point under the cursor fixed', () => {
		const anchor = { x: 120, y: 300 }
		const start = { zoom: 1.5, focalX: 0.3, focalY: 0.6 }
		const before = coverRect(img.w, img.h, box.w, box.h, start.zoom, start.focalX, start.focalY)
		const imgPoint = { x: (anchor.x - before.x) / before.w, y: (anchor.y - before.y) / before.h }

		const view = zoomPhoto(img, box, start, 2.5, anchor)
		const after = coverRect(img.w, img.h, box.w, box.h, view.zoom, view.focalX, view.focalY)
		expect((anchor.x - after.x) / after.w).toBeCloseTo(imgPoint.x, 5)
		expect((anchor.y - after.y) / after.h).toBeCloseTo(imgPoint.y, 5)
	})

	it('clamps zoom between 1 and the maximum', () => {
		expect(zoomPhoto(img, box, centred, 99, { x: 0, y: 0 }).zoom).toBe(MAX_ZOOM)
		expect(zoomPhoto(img, box, centred, 0.2, { x: 0, y: 0 }).zoom).toBe(1)
	})

	it('stays within 0..1 focal bounds', () => {
		const view = zoomPhoto(img, box, centred, 4, { x: 0, y: 0 })
		expect(view.focalX).toBeGreaterThanOrEqual(0)
		expect(view.focalX).toBeLessThanOrEqual(1)
	})
})
