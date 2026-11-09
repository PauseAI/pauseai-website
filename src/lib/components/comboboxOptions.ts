/** `aliases` are extra strings the typeahead matches (e.g. an abbreviation) but never shows. */
export type ComboboxOption = { label: string; value: string; aliases?: string[] }

export function exactMatch(items: ComboboxOption[], text: string): ComboboxOption | undefined {
	const t = text.trim().toLowerCase()
	return items.find(
		(i) =>
			i.label.toLowerCase() === t ||
			i.value.toLowerCase() === t ||
			i.aliases?.some((a) => a.toLowerCase() === t)
	)
}

/** @param currentLabel The label of the current selection, for single select. */
export function visibleOptions(
	items: ComboboxOption[],
	query: string,
	currentLabel?: string
): ComboboxOption[] {
	const q = query.trim().toLowerCase()
	// Empty query, or the query is just the current selection (user
	// reopened the list): show the full list.
	if (!q || query === currentLabel) return items
	const aliased = items.filter((i) => i.aliases?.some((a) => a.toLowerCase() === q))
	const rest = items.filter((i) => !aliased.includes(i))
	const starts = rest.filter((i) => i.label.toLowerCase().startsWith(q))
	const contains = rest.filter(
		(i) => !i.label.toLowerCase().startsWith(q) && i.label.toLowerCase().includes(q)
	)
	return [...aliased, ...starts, ...contains]
}

/**
 * Which row to highlight after typing. Typing a full name selects it and so brings back the
 * full list, where the first row would be wrong: Enter would pick that row instead.
 */
export function highlightAfterTyping(visible: ComboboxOption[], selectedValue: string): number {
	return Math.max(
		visible.findIndex((i) => i.value === selectedValue),
		0
	)
}
