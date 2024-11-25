import { error } from '@sveltejs/kit'
import { i18n } from '$lib/i18n.js'

const runtime = i18n.config.runtime

export async function load({ params: { slug }, depends }) {
	depends('paraglide:lang')
	try {
		const language = runtime.languageTag()

		const { default: content, metadata: meta = {} } = await importMarkdown(language, slug)

		return {
			content,
			meta,
			slug
		}
	} catch (e) {
		throw error(404, `Could not find ${slug}`)
	}
}

async function importMarkdown(language: string, slug: string) {
	if (language == runtime.sourceLanguageTag) {
		return await import(`../../posts/${slug}.md`)
	} else {
		try {
			return await import(`../../temp/translations/md/${language}/${slug}.md`)
		} catch (error) {
			if (import.meta.env.DEV) {
				return {
					default: `## Couldn't import translation!\n(This is only tolerated in development mode.)`
				}
			}
			throw error
		}
	}
}
