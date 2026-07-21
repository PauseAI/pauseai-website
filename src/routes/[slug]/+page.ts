import { dev } from '$app/environment'
import { getLocale } from '$lib/paraglide/runtime'
import type { PageLoad } from './$types'
import { asError } from '$lib/utils'
import type { DescriptiveFrontmatterMeta } from '$lib/types'

type MarkdownModule = {
	default: import('svelte').Component
	metadata: DescriptiveFrontmatterMeta
}

export const load: PageLoad = async ({ params: { slug }, depends, data: serverData }) => {
	depends('paraglide:lang')
	try {
		const locale = getLocale()
		const { default: content, metadata: meta = {} } = await importMarkdown(locale, slug)

		return {
			...serverData,
			content,
			meta,
			slug
		}
	} catch {
		throw asError(404, `Could not find ${slug}`)
	}
}

async function importMarkdown(locale: string, slug: string): Promise<MarkdownModule> {
	// For English (source language), import directly from source
	if (locale === 'en') {
		return (await import(`../../posts/${slug}.md`)) as MarkdownModule
	} else {
		try {
			return (await import(`../../../l10n-cage/md/${locale}/${slug}.md`)) as MarkdownModule
		} catch (error) {
			if (dev) {
				return {
					default: `## Couldn't import translation!\n(This is only tolerated in development mode.)`
				} as unknown as MarkdownModule // The string default doesn't match the SvelteComponent type, but this is a dev-only fallback
			}
			throw error
		}
	}
}
