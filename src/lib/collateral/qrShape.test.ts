import { describe, expect, it } from 'vitest'
import { qrMatrix } from './qr'
import { pauseBars, QR_INK, qrShape, qrSvg } from './qrShape'

const target = 'https://pauseai.uk'

/** Dark modules outside the three 7x7 corner marks. */
function dataModules(text: string): number {
	const m = qrMatrix(text)
	const n = m.length
	const inFinder = (r: number, c: number) =>
		(r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)
	return m.flatMap((row, r) => row.filter((dark, c) => dark && !inFinder(r, c))).length
}

describe('qrShape', () => {
	it('draws one round dot per data module when there is no logo', () => {
		expect(qrShape(target, 500, false).dots).toHaveLength(dataModules(target))
	})

	it('draws the corner marks as rings and solid squares, not as dots', () => {
		const shape = qrShape(target, 500, false)
		expect(shape.finderEyes).toHaveLength(3)
		// Two rounded rectangles per corner mark: the ring's outside and its hole.
		expect(shape.finderRings.match(/M/g)).toHaveLength(6)
		const n = shape.modules
		const cell = shape.finderEyes[0].s / 3
		const pad = shape.size * 0.07
		for (const d of shape.dots) {
			const col = (d.x - pad) / cell
			const row = (d.y - pad) / cell
			const inFinder = (row < 7 && col < 7) || (row < 7 && col > n - 7) || (row > n - 7 && col < 7)
			expect(inFinder).toBe(false)
		}
	})

	it('leaves a gap in the middle for the logo', () => {
		const withLogo = qrShape(target, 500, true)
		const without = qrShape(target, 500, false)
		expect(withLogo.dots.length).toBeLessThan(without.dots.length)
		expect(withLogo.logoRadius).toBeGreaterThan(0)
		// No dot reaches into the square around the logo, as wide as the logo.
		for (const d of withLogo.dots) {
			const dist = Math.max(Math.abs(d.x - withLogo.centre.x), Math.abs(d.y - withLogo.centre.y))
			expect(dist - d.r - withLogo.logoRadius!).toBeGreaterThan(-1e-9)
		}
	})

	it("clears the corners of that square, past the logo's circle", () => {
		const shape = qrShape(target, 1000, true)
		const without = qrShape(target, 1000, false)
		const R = shape.logoRadius!
		// A dark module in the square's corner, outside the circle, is dropped all the same.
		const corner = (d: { x: number; y: number }) => {
			const dx = Math.abs(d.x - shape.centre.x)
			const dy = Math.abs(d.y - shape.centre.y)
			return dx < R && dy < R && Math.hypot(dx, dy) > R
		}
		expect(without.dots.some(corner)).toBe(true)
		expect(shape.dots.some(corner)).toBe(false)
	})

	it.each(['https://asdd.com', target, `https://pauseai.uk/${'a'.repeat(150)}`])(
		"leaves the same hairline between the logo and the nearest dots for %s, whatever the code's density",
		(link) => {
			const shape = qrShape(link, 1000, true)
			const cell = shape.finderEyes[0].s / 3
			const gaps = shape.dots.map(
				(d) =>
					Math.max(Math.abs(d.x - shape.centre.x), Math.abs(d.y - shape.centre.y)) -
					d.r -
					shape.logoRadius!
			)
			// A small fraction of a module.
			expect(Math.min(...gaps) / cell).toBeCloseTo(0.15, 6)
		}
	)

	it('keeps the logo small enough for error correction to cover the gap', () => {
		const withLogo = qrShape(target, 500, true)
		const without = qrShape(target, 500, false)
		const removed = 1 - withLogo.dots.length / without.dots.length
		// Level H recovers about 30% of the code. Stay well inside that.
		expect(removed).toBeLessThan(0.2)
	})

	it('keeps every dot inside the panel with a quiet margin', () => {
		const shape = qrShape(target, 500, true)
		for (const d of shape.dots) {
			expect(d.x - d.r).toBeGreaterThan(0)
			expect(d.y - d.r).toBeGreaterThan(0)
			expect(d.x + d.r).toBeLessThan(shape.size)
			expect(d.y + d.r).toBeLessThan(shape.size)
		}
	})

	it('scales with the requested size', () => {
		expect(qrShape(target, 1000, false).dots[0].r).toBeCloseTo(
			qrShape(target, 500, false).dots[0].r * 2,
			5
		)
	})

	it('keeps the logo bars inside the logo circle', () => {
		const r = 40
		const b = pauseBars(r)
		expect(Math.hypot(b.leftX, b.y)).toBeLessThan(r)
		expect(Math.hypot(b.rightX + b.w, -b.y)).toBeLessThan(r)
	})
})

describe('qrSvg', () => {
	it('is a self-contained SVG at the requested size', () => {
		const svg = qrSvg(qrShape(target, 800, true), { background: '#FFFFFF' })
		expect(svg.startsWith('<svg ')).toBe(true)
		expect(svg).toContain('width="800"')
		expect(svg).toContain('viewBox="0 0 800 800"')
		expect(svg.endsWith('</svg>')).toBe(true)
		expect(svg).not.toMatch(/<script|href=|<image|<text/i)
	})

	it('draws corner rings with the even-odd rule so the hole shows', () => {
		expect(qrSvg(qrShape(target, 400, false), { background: null })).toContain(
			'fill-rule="evenodd"'
		)
	})

	it('can draw a square panel for the standalone generator', () => {
		const shape = qrShape(target, 400, false)
		expect(qrSvg(shape, { background: '#FFFFFF' })).toContain('rx=')
		expect(qrSvg(shape, { background: '#FFFFFF', roundedPanel: false })).not.toContain('rx=')
	})

	it('draws the dots in pure black', () => {
		expect(qrSvg(qrShape(target, 400, false), { background: null })).toContain(`fill="${QR_INK}"`)
		expect(QR_INK).toBe('#000000')
	})

	it('has a background panel only when asked', () => {
		const shape = qrShape(target, 400, false)
		expect(qrSvg(shape, { background: '#FFFFFF' })).toContain('fill="#FFFFFF"')
		expect(qrSvg(shape, { background: null })).not.toContain('fill="#FFFFFF"')
	})

	it('includes the pause symbol only with a logo', () => {
		const withLogo = qrSvg(qrShape(target, 400, true), { background: null })
		const without = qrSvg(qrShape(target, 400, false), { background: null })
		expect(withLogo).toContain(`fill="#FF9416"`)
		expect(without).not.toContain(`fill="#FF9416"`)
	})
})
