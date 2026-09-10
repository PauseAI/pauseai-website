import { describe, expect, it } from 'vitest'
import { isValidUKPostcode, normaliseUKPostcode } from './options.js'

describe('isValidUKPostcode', () => {
	it('accepts a full postcode, with or without the inner space', () => {
		for (const value of [
			'SW1A 1AA',
			'SW1A1AA',
			'M1 1AE',
			'M11AE',
			'B33 8TH',
			'DN55 1PT',
			'ec1a 1bb'
		]) {
			expect(isValidUKPostcode(value)).toBe(true)
		}
	})

	it('ignores surrounding whitespace', () => {
		expect(isValidUKPostcode('  SW1A 1AA  ')).toBe(true)
	})

	it('rejects an outward code on its own — the inward half is required', () => {
		for (const value of ['SW1A', 'M1', 'B33', 'CR2', 'DN55', 'EC1A']) {
			expect(isValidUKPostcode(value)).toBe(false)
		}
	})

	it('rejects non-UK shapes and junk', () => {
		for (const value of ['', '12345', 'ZZ', 'SW1A 1A', 'SW1A 1AAA', 'postcode', '1SW 1AA']) {
			expect(isValidUKPostcode(value)).toBe(false)
		}
	})
})

describe('normaliseUKPostcode', () => {
	it('uppercases and puts exactly one space before the inward code', () => {
		expect(normaliseUKPostcode('  sw1a1aa ')).toBe('SW1A 1AA')
		expect(normaliseUKPostcode('sw1a   1aa')).toBe('SW1A 1AA')
		expect(normaliseUKPostcode('M11AE')).toBe('M1 1AE')
	})

	it('leaves a too-short value compacted for validation to reject', () => {
		expect(normaliseUKPostcode(' m1 ')).toBe('M1')
	})
})
