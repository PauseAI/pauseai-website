import { getLocale } from '$lib/paraglide/runtime'
import type { DescriptiveFrontmatterMeta } from '$lib/types'
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

export const load: PageServerLoad = async ({ params: { slug } }) => {
	const locale = getLocale()
	const cssUrls = cssForPost(slug, locale)
	const { pictures, banner, metaImageUrl } = await imagesForPost(locale, slug)

	return { cssUrls, pictures, banner, metaImageUrl }
}

function slugFromPostPath(path: string): string {
	return path.slice(path.lastIndexOf('/') + 1, -'.md'.length)
}
