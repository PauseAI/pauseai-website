import { error } from '@sveltejs/kit'

export async function load({ params }) {
	try {
		let slug = params.slug
		const post = await import(`../../posts/${slug}.md`)

		return {
			content: post.default,
			meta: post.metadata || {},
			slug
		}
	} catch (e) {
		throw error(404, `Could not find ${params.slug}`)
	}
}
