import { json } from '@sveltejs/kit'
import type { FrontmatterMeta, Post } from '$lib/types'
import { outcomesMeta } from '../../outcomes/meta'
import { communitiesMeta } from '../../communities/communities'
import { meta as pdoomMeta } from '../../pdoom/meta'
import { meta as emailBuilderMeta } from '../../email-builder/meta'
import { meta as statementMeta } from '../../statement/meta'
import { meta as dearSirDemisMeta } from '../../dear-sir-demis-2025/meta'
import { meta as aboutMeta } from '../../about/meta'
import { meta as contactMeta } from '../../contact-us/meta'
import { meta as pressMeta } from '../../press/meta'
import { meta as fundingMeta } from '../../funding/meta'
import type { RequestHandler } from './$types'

export type PostsApiResponse = Post[]

/** When adding an extra route, make sure to add the metadata here for SEO purposes */
const hardCodedPages: Post[] = [
	outcomesMeta,
	communitiesMeta,
	pdoomMeta,
	emailBuilderMeta,
	statementMeta,
	dearSirDemisMeta,
	aboutMeta,
	contactMeta,
	pressMeta,
	fundingMeta
]

function getPosts() {
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
			const metadata = file.metadata as FrontmatterMeta
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

export const GET: RequestHandler = () => {
	const posts = getPosts()
	return json(posts satisfies PostsApiResponse)
}
