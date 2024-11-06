import SubstackClient from '$lib/clients/substack'

const BASE_URL = 'https://pauseai.substack.com/api/v1'

export async function GET({ setHeaders }) {
	const client = new SubstackClient(BASE_URL)
	const posts = await client.posts({
		limit: 8,
		offset: 0
	})
	const postsWithoutBody = posts.map((post) => {
		return {
			...post,
			body_html: ''
		}
	})
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})
	return new Response(JSON.stringify(postsWithoutBody))
}
