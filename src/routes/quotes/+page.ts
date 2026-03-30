import escape from 'escape-html'

import quotes from './data.json'
import type Quote from './quote.d.ts'
import type { PageLoad } from './$types'

export const load: PageLoad = (_event) => {
	const compiledQuotes: Quote[] = quotes.quotes.map(({ text, ...quote }) => ({
		text: escape(text).replaceAll(/\*\*(.+?)\*\*/g, '<span style="font-weight: bold">$1</span>'),
		...quote
	}))
	return { quotes: compiledQuotes }
}
