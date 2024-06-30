import { redirect } from '@sveltejs/kit'

export async function load({ fetch }) {
	const response = await fetch(
		'/api/posts?' + new URLSearchParams({ subpath: '/risques' }).toString()
	)
	const posts = await response.json()

	throw redirect(307, `${posts[0].slug}`)
}
