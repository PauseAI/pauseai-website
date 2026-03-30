import type { PostsApiResponse } from '$api/posts/+server.js'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('api/posts')
	const posts: PostsApiResponse = await response.json()
	return { posts }
}
