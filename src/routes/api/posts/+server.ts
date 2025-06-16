import { json } from '@sveltejs/kit'
import type { Post } from '$lib/types'
import { outcomesMeta } from '../../outcomes/meta'
import { communitiesMeta } from '../../communities/communities'
import { meta as pdoomMeta } from '../../pdoom/meta'
import { meta as quotesMeta } from '../../quotes/meta'
import { meta as emailBuilderMeta } from '../../email-builder/meta'
import { meta as teamsMeta } from '../../teams/meta'
import { meta as pfpgenMeta } from '../../pfp/meta'
import { meta as statementMeta } from '../../statement/meta'

/** When adding an extra route, make sure to add the metadata here for SEO purposes */
const hardCodedPages: Post[] = [
	outcomesMeta,
	communitiesMeta,
	pdoomMeta,
	quotesMeta,
	emailBuilderMeta,
	teamsMeta,
	pfpgenMeta,
	statementMeta
]

async function getPosts() {
	let posts: Post[] = []

	const paths = import.meta.glob('/src/posts/*.md', { eager: true })

	for (const path in paths) {
		const file = paths[path]
		const slug = path.split('/').at(-1)?.replace('.md', '')

		if (
			file &&
			typeof file === 'object' &&
			'metadata' in file &&
			slug &&
			!slug.startsWith('debug.')
		) {
			const metadata = file.metadata as Omit<Post, 'slug'>
			const post = { ...metadata, slug } satisfies Post
			posts.push(post)
		}
	}

	posts.push(...hardCodedPages)

	posts = posts.sort(
		(first, second) =>
			(second.date ? new Date(second.date).getTime() : 0) -
			(first.date ? new Date(first.date).getTime() : 0)
	)

	return posts
}

export async function GET() {
	const posts = await getPosts()
	return json(posts)
}
