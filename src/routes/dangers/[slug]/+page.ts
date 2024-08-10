import { error } from '@sveltejs/kit'
type MdModule = typeof import('*.md')

export async function load({ params: { slug } }) {
	try {
		const { default: content, metadata }: MdModule = await import(
			`../../../posts/dangers/${slug}.md`
		)

		return {
			content,
			metadata,
			slug
		}
	} catch (e) {
		throw error(404, `Could not find ${slug}`)
	}
}
