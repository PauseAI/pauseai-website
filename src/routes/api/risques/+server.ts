import { json } from '@sveltejs/kit'
import { getPosts } from '$lib/api'

export function GET() {
	const posts = getPosts('/risques')
	return json(posts)
}
