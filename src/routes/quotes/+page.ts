import escape from 'escape-html'

import quotes from './data.json'
import type Quote from './quote.d.ts'

export async function load() {
	const compiledQuotes: Quote[] = quotes.map(({ text, ...quote }) => ({
		text: escape(text).replaceAll(/\*\*(.+?)\*\*/g, '<span style="font-weight: bold">$1</span>'),
		...quote
	}))
	return { quotes: compiledQuotes }
}
