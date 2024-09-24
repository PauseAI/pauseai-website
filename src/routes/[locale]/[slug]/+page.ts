import { error } from '@sveltejs/kit'

export async function load({ params: { locale, slug }, url }) {
	const lang = locale || 'en'
	const pageSlug = slug

	// Log the extracted values
	console.log('Locale:', locale)
	console.log('Language:', lang)
	console.log('Page Slug:', pageSlug)

	try {
		let content, meta
		if (lang === 'en') {
			// For English, look directly in the /posts folder
			;({ default: content, metadata: meta = {} } = await import(`../../../posts/${pageSlug}.md`))
		} else {
			// For other languages, use the language-specific folder
			;({ default: content, metadata: meta = {} } = await import(
				`../../../posts/${lang}/${pageSlug}.md`
			))
		}

		return {
			content,
			meta,
			slug: pageSlug,
			lang
		}
	} catch (e) {
		console.error('Error loading content:', e)
		throw error(404, `Could not find ${pageSlug} in ${lang === 'en' ? 'default' : lang} language`)
	}
}
