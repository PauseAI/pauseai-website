import { redirect } from '@sveltejs/kit'

export async function load({ fetch }) {
	const response = await fetch('/api/risques')
	const posts = await response.json()

	throw redirect(307, `${posts[0].slug}`)
}
