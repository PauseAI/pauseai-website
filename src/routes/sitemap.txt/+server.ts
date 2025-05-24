import { url } from '$lib/config'
import type { Post } from '$lib/types'

export const prerender = true

export async function GET({ fetch }) {
	const response = await fetch('api/posts')
	const posts: Post[] = await response.json()
	const website = url

	const headers = { 'Content-Type': 'text/plain' }

	const sitemap = posts
		.map(({ slug }) => `${website}/en/${slug}\n`)
		.join('')
		.trim()

	return new Response(sitemap, { headers })
}
