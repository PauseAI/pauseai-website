import { error } from '@sveltejs/kit'

export async function load({ params: { slug }, url }) {
	const lang = url.searchParams.get('lang') || 'en'
	try {
		let content, meta
		if (lang === 'en') {
			// For English, look directly in the /posts folder
			;({ default: content, metadata: meta = {} } = await import(`../../posts/${slug}.md`))
		} else {
			// For other languages, use the language-specific folder
			;({ default: content, metadata: meta = {} } = await import(`../../posts/${lang}/${slug}.md`))
		}

		return {
			content,
			meta,
			slug,
			lang
		}
	} catch (e) {
		throw error(404, `Could not find ${slug} in ${lang === 'en' ? 'default' : lang} language`)
	}
}
