import { describe, expect, it } from 'vitest'
import {
	exactMatch,
	highlightAfterTyping,
	visibleOptions,
	type ComboboxOption
} from './comboboxOptions'

const option = (label: string, aliases?: string[]): ComboboxOption => ({
	label,
	value: label,
	...(aliases ? { aliases } : {})
})
const ITEMS = [
	option('Afghanistan'),
	option('Spain'),
	option('Sweden'),
	option('United Kingdom', ['UK'])
]

/** The row Enter would pick after typing this text, following what the component does. */
function pickedByEnter(query: string): string {
	const selected = exactMatch(ITEMS, query)?.value ?? ''
	const visible = visibleOptions(ITEMS, query, selected || undefined)
	return visible[highlightAfterTyping(visible, selected)].value
}

describe('typing in the combobox, then pressing Enter', () => {
	it.each([
		['a full name', 'Spain', 'Spain'],
		['a full name that is not first in the list', 'United Kingdom', 'United Kingdom'],
		['a full name in another case', 'spain', 'Spain'],
		['a full name with stray spaces', ' Spain ', 'Spain'],
		['an alias', 'UK', 'United Kingdom'],
		['the start of a name', 'Spa', 'Spain'],
		['the middle of a name', 'eden', 'Sweden'],
		['the first name in the list', 'Afghanistan', 'Afghanistan']
	])('picks the right row for %s', (_label, query, expected) => {
		expect(pickedByEnter(query)).toBe(expected)
	})
})

describe('visibleOptions', () => {
	it('shows everything when empty, or when reopened on the current selection', () => {
		expect(visibleOptions(ITEMS, '  ')).toEqual(ITEMS)
		expect(visibleOptions(ITEMS, 'Spain', 'Spain')).toEqual(ITEMS)
	})

	it('filters otherwise, with aliases, then starts, then contains', () => {
		const labels = (query: string) => visibleOptions(ITEMS, query).map(({ label }) => label)

		expect(labels('s')).toEqual(['Spain', 'Sweden', 'Afghanistan'])
		expect(labels('uk')).toEqual(['United Kingdom'])
		expect(labels('atlantis')).toEqual([])
	})
})

describe('highlightAfterTyping', () => {
	it('starts at the top when nothing is selected or the selection is hidden', () => {
		expect(highlightAfterTyping(ITEMS, '')).toBe(0)
		expect(highlightAfterTyping([], 'Spain')).toBe(0)
	})
})
