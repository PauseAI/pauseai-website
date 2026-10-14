// University lookup for the signup form, keyed by the country names in
// COUNTRIES ($lib/components/onboarding/options). See README.md in this
// directory for how to add a country.
import gb from './gb.json'

export type University = {
	name: string
	/** Only where one is commonly known, e.g. "LSE". Unique within a country. */
	abbreviation?: string
	/** The country's official provider id (UKPRN for the UK), for de-duplication. */
	id?: string
}

export type UniversityOption = {
	/** What the visitor sees, e.g. "University of Nottingham (UoN)". */
	label: string
	/** What is submitted and stored: the plain name. */
	value: string
	/** Extra strings the typeahead matches, e.g. the abbreviation. */
	aliases: string[]
}

export const UNIVERSITIES_BY_COUNTRY: Record<string, University[]> = {
	'United Kingdom': gb
}

export function hasUniversities(country: string): boolean {
	return country in UNIVERSITIES_BY_COUNTRY
}

export function universityOptions(country: string): UniversityOption[] {
	return (UNIVERSITIES_BY_COUNTRY[country] ?? []).map((u) => ({
		label: u.abbreviation ? `${u.name} (${u.abbreviation})` : u.name,
		value: u.name,
		aliases: u.abbreviation ? [u.abbreviation] : []
	}))
}

export function isKnownUniversity(country: string, name: string): boolean {
	return (UNIVERSITIES_BY_COUNTRY[country] ?? []).some((u) => u.name === name)
}
