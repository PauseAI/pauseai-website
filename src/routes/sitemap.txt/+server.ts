import { url } from '$lib/config'
import type { Post } from '$lib/types'
import type { RequestHandler } from './$types'

export const prerender = true

export const GET: RequestHandler = async ({ fetch }) => {
	const response = await fetch('api/posts')
	const posts: Post[] = await response.json()
	const website = url

	const headers = { 'Content-Type': 'text/plain' }

	const sitemap = posts
		.map(({ slug }) => `${website}/${slug}\n`)
		.join('')
		.trim()

	return new Response(sitemap, { headers })
}
