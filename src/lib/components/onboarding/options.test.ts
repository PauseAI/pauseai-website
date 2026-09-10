import { describe, expect, it } from 'vitest'
import { isValidUKPostcode, normaliseUKPostcode } from './options.js'

describe('isValidUKPostcode', () => {
	it('accepts an outward code on its own', () => {
		for (const value of ['SW1A', 'M1', 'B33', 'CR2', 'DN55', 'EC1A', 'W1']) {
			expect(isValidUKPostcode(value)).toBe(true)
		}
	})

	it('accepts a full postcode, with or without the inner space', () => {
		for (const value of ['SW1A 1AA', 'SW1A1AA', 'M1 1AE', 'B33 8TH', 'DN55 1PT', 'ec1a 1bb']) {
			expect(isValidUKPostcode(value)).toBe(true)
		}
	})

	it('ignores surrounding whitespace', () => {
		expect(isValidUKPostcode('  SW1A 1AA  ')).toBe(true)
	})

	it('rejects non-UK shapes and junk', () => {
		for (const value of ['', '12345', 'ZZ', 'SW1A 1A', 'SW1A 1AAA', 'postcode', '1SW 1AA']) {
			expect(isValidUKPostcode(value)).toBe(false)
		}
	})
})

describe('normaliseUKPostcode', () => {
	it('uppercases, trims and collapses internal spacing', () => {
		expect(normaliseUKPostcode('  sw1a   1aa ')).toBe('SW1A 1AA')
		expect(normaliseUKPostcode('m1')).toBe('M1')
	})
})
