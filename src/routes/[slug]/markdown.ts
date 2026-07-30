import { dev } from '$app/environment'
import type { DescriptiveFrontmatterMeta } from '$lib/types'

export type MarkdownModule = {
	default: import('svelte').Component
	metadata: DescriptiveFrontmatterMeta
}

/**
 * Imports the compiled markdown module for a given locale + slug.
 *
 * Shared between `+page.server.ts` (to read `metadata._images` and resolve
 * Picture objects) and `+page.ts` (to render the content). The dynamic
 * import paths are relative to this file's location in `src/routes/[slug]/`.
 */
export async function importMarkdown(locale: string, slug: string): Promise<MarkdownModule> {
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
