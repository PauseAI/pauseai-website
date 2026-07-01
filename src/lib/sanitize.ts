export function safeHtml(dirty: string): string {
	// Rewrite <a> tags: keep only href, block javascript:/data: URIs
	let result = dirty.replace(/<a\b[^>]*>/gi, (match) => {
		const hrefMatch = match.match(/\bhref\s*=\s*"([^"]*)"/i)
		if (!hrefMatch) return ''
		const href = hrefMatch[1]
		if (/^\s*(javascript|data|vbscript):/i.test(href)) return ''
		return `<a href="${href}">`
	})
	// Strip attributes from <strong>
	result = result.replace(/<strong\b[^>]*>/gi, '<strong>')
	// Strip all other tags (including event handlers on any tag)
	result = result.replace(/<(?!\/?(a|strong)\b)[^>]+>/gi, '')
	return result
}
