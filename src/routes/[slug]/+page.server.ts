import { getLocale } from '$lib/paraglide/runtime'
import { generateCacheControlRecord } from '$lib/utils'
import type { DescriptiveFrontmatterMeta } from '$lib/types'
import { dataForPost } from './frontmatter-data.server'
import { importMarkdown } from './markdown'
import { cssForPost } from './post-css.server'
import { imagesForPost } from './post-images.server'
import type { EntryGenerator, PageServerLoad } from './$types'

type MarkdownEntryModule = {
	metadata?: DescriptiveFrontmatterMeta
}

const postModules = import.meta.glob<MarkdownEntryModule>('/src/posts/*.md', {
	eager: true
})

export const entries: EntryGenerator = () =>
	Object.entries(postModules)
		.filter(([, post]) => post.metadata?.prerender !== false)
		.map(([path]) => ({ slug: slugFromPostPath(path) }))

export const prerender = 'auto'

export const load: PageServerLoad = async ({ params: { slug }, fetch, setHeaders }) => {
	const locale = getLocale()
	const cssUrls = cssForPost(slug, locale)
	const [{ pictures, banner, metaImageUrl }, frontmatterData, { metadata }] = await Promise.all([
		imagesForPost(locale, slug),
		dataForPost(locale, slug, fetch),
		importMarkdown(locale, slug)
	])

	// Dynamically rendered posts (prerender: false) benefit from a cache header
	// so CDN/edge caches can serve repeated requests without hitting the origin.
	if (metadata.prerender === false) {
		setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))
	}

	return { cssUrls, pictures, banner, metaImageUrl, frontmatterData }
}

function slugFromPostPath(path: string): string {
	return path.slice(path.lastIndexOf('/') + 1, -'.md'.length)
}
