import { describe, expect, it } from 'vitest'
import { presetCountry } from './presetCountry'

const preset = (query: string) => presetCountry(new URLSearchParams(query))

describe('presetCountry', () => {
	it('presets a country from the list', () => {
		expect(preset('country=Sweden')).toBe('Sweden')
		expect(preset('country=United%20Kingdom')).toBe('United Kingdom')
	})

	it('presets nothing for a value not on the list', () => {
		expect(preset('country=Narnia')).toBe('')
		expect(preset('country=sweden')).toBe('')
		expect(preset('country=SE')).toBe('')
	})

	it('presets nothing for an empty or missing value', () => {
		expect(preset('country=')).toBe('')
		expect(preset('')).toBe('')
	})
})
