import type { PostsApiResponse } from '$api/posts/+server.js'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('api/posts')
	const posts = (await response.json()) as PostsApiResponse
	return { posts }
}
