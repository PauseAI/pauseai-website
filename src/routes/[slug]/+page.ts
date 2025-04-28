import type { FrontmatterMeta } from '$lib/types'
import { error } from '@sveltejs/kit'

export async function load({ params: { slug } }) {
	try {
		const postModule = await import(`../../posts/${slug}.md`)
		const content = postModule.default
		const meta = postModule.metadata as FrontmatterMeta

		return {
			content,
			meta,
			slug
		}
	} catch (e) {
		throw error(404, `Could not find ${slug}`)
	}
}
