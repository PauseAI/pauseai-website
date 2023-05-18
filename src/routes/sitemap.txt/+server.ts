import * as config from '$lib/config'
import type { Post } from '$lib/types'

export const prerender = true

export async function GET({ fetch }) {
	const response = await fetch('api/posts')
	const posts: Post[] = await response.json()
	const website = config.url

	const headers = { 'Content-Type': 'text/plain' }

	const sitemap = posts
		.map((post) => `${website}/${post.slug}\n`)
		.join('')
		.trim()

	return new Response(sitemap, { headers })
}
