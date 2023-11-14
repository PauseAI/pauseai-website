import escape from 'escape-html'

import quotes from './data.json'

export async function load() {
	const compiledQuotes = quotes.map(({ text, ...quote }) => ({
		text: escape(text).replaceAll(/\*\*(.+?)\*\*/g, '<span style="font-weight: bold">$1</span>'),
		...quote
	}))
	return { quotes: compiledQuotes }
}
