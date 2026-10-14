import { COUNTRIES } from '$lib/components/onboarding/options.js'
import { describe, expect, it } from 'vitest'
import { COUNTRY_BY_ISO_CODE } from './countryCodes'

describe('COUNTRY_BY_ISO_CODE', () => {
	it('has a code for every country the onboarding form offers', () => {
		const spellings = new Set(Object.values(COUNTRY_BY_ISO_CODE))
		expect(COUNTRIES.filter((country) => !spellings.has(country))).toEqual([])
	})

	it('gives each country one code', () => {
		const values = Object.values(COUNTRY_BY_ISO_CODE)
		expect(values.length).toBe(new Set(values).size)
	})

	it.each([
		['TZ', 'Tanzania'],
		['GB', 'United Kingdom'],
		['US', 'United States'],
		['CA', 'Canada'],
		['NL', 'Netherlands'],
		['SE', 'Sweden'],
		['CD', 'DR Congo'],
		['CI', "Côte d'Ivoire"]
	])('resolves %s to %s', (code, country) => {
		expect(COUNTRY_BY_ISO_CODE[code]).toBe(country)
	})
})
