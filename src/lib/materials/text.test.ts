import { describe, expect, it } from 'vitest'
import { coverRect, fitText, wrapLines, type Measure } from './text'

// Every character is 0.5em wide.
const measure: Measure = (text, size) => text.length * size * 0.5

describe('wrapLines', () => {
	it('wraps on word boundaries', () => {
		// 10px font -> 5px per char, 50px box -> 10 chars per line
		expect(wrapLines(measure, 'aaaa bbbb cccc', 10, 50)).toEqual(['aaaa bbbb', 'cccc'])
	})

	it('keeps explicit newlines', () => {
		expect(wrapLines(measure, 'one\ntwo', 10, 500)).toEqual(['one', 'two'])
	})

	it('does not break a single long word', () => {
		expect(wrapLines(measure, 'supercalifragilistic', 10, 50)).toEqual(['supercalifragilistic'])
	})
})

describe('fitText', () => {
	const base = { maxWidth: 200, maxHeight: 100, maxFont: 60, minFont: 10, lineHeight: 1 }

	it('keeps the max font when the text already fits', () => {
		const r = fitText(measure, 'Hi', base)
		expect(r.fontSize).toBe(60)
		expect(r.overflow).toBe(false)
	})

	it('shrinks long text until it fits the box', () => {
		const r = fitText(measure, 'Safety before superintelligence, now', base)
		expect(r.fontSize).toBeLessThan(60)
		expect(r.height).toBeLessThanOrEqual(base.maxHeight)
		for (const line of r.lines) expect(measure(line, r.fontSize)).toBeLessThanOrEqual(base.maxWidth)
		expect(r.overflow).toBe(false)
	})

	it('shrinks so a long single word fits the width', () => {
		const r = fitText(measure, 'superintelligence', base)
		expect(measure('superintelligence', r.fontSize)).toBeLessThanOrEqual(base.maxWidth)
	})

	it('reports overflow at the minimum font instead of looping forever', () => {
		const r = fitText(measure, 'word '.repeat(200), { ...base, maxHeight: 20 })
		expect(r.fontSize).toBe(10)
		expect(r.overflow).toBe(true)
	})
})

describe('coverRect', () => {
	it('covers the box and centres by default', () => {
		// 200x100 image into 100x100 box -> scale 1, 200x100, centred horizontally
		expect(coverRect(200, 100, 100, 100)).toEqual({ x: -50, y: 0, w: 200, h: 100 })
	})

	it('moves with the focal point and zoom', () => {
		const r = coverRect(200, 100, 100, 100, 2, 0, 0)
		expect(r).toEqual({ x: 0, y: 0, w: 400, h: 200 })
	})

	it('never zooms out below cover', () => {
		expect(coverRect(200, 100, 100, 100, 0.2)).toEqual(coverRect(200, 100, 100, 100, 1))
	})
})
