import type { FrontmatterMeta } from '$lib/types'
import { error } from '@sveltejs/kit'
import { getLocale } from '$lib/paraglide/runtime'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params: { slug }, depends }) => {
	depends('paraglide:lang')
	try {
		const locale = getLocale()
		const { default: content, metadata: meta = {} } = await importMarkdown(locale, slug)

		return {
			content,
			meta,
			slug
		}
	} catch (e) {
		throw error(404, `Could not find ${slug}`)
	}
}

async function importMarkdown(locale: string, slug: string) {
	// For English (source language), import directly from source
	if (locale === 'en') {
		return await import(`../../posts/${slug}.md`)
	} else {
		try {
			return await import(`../../../l10n-cage/md/${locale}/${slug}.md`)
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
