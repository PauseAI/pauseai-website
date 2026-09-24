import { describe, expect, it } from 'vitest'
import { COUNTRIES } from '$lib/components/onboarding/options'
import {
	UNIVERSITIES_BY_COUNTRY,
	hasUniversities,
	isKnownUniversity,
	universityOptions
} from './index'

describe('universities', () => {
	it('keys every list by a country the form offers', () => {
		for (const country of Object.keys(UNIVERSITIES_BY_COUNTRY)) {
			expect(COUNTRIES).toContain(country)
		}
	})

	it('has unique names and abbreviations within a country', () => {
		for (const list of Object.values(UNIVERSITIES_BY_COUNTRY)) {
			const names = list.map((u) => u.name)
			expect(new Set(names).size).toBe(names.length)
			const abbreviations = list.flatMap((u) => (u.abbreviation ? [u.abbreviation] : []))
			expect(new Set(abbreviations).size).toBe(abbreviations.length)
		}
	})

	it('labels with the abbreviation when there is one, and stores the plain name', () => {
		const options = universityOptions('United Kingdom')
		expect(options).toContainEqual({
			label: 'University of Nottingham (UoN)',
			value: 'University of Nottingham',
			aliases: ['UoN']
		})
		expect(options).toContainEqual({
			label: 'University of Bristol',
			value: 'University of Bristol',
			aliases: []
		})
	})

	it('only accepts names from the list, for the right country', () => {
		expect(hasUniversities('United Kingdom')).toBe(true)
		expect(hasUniversities('France')).toBe(false)
		expect(isKnownUniversity('United Kingdom', 'University College London')).toBe(true)
		expect(isKnownUniversity('United Kingdom', 'University of Nottingham (UoN)')).toBe(false)
		expect(isKnownUniversity('France', 'University College London')).toBe(false)
	})
})
