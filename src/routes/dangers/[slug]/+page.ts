import { error } from '@sveltejs/kit'

export async function load({ params: { slug } }) {
	try {
		const { default: content, metadata: meta = {} } = await import(
			`../../../posts/dangers/${slug}.md`
		)

		return {
			content,
			meta,
			slug
		}
	} catch (e) {
		throw error(404, `Could not find ${slug}`)
	}
}
