import type { Person } from '$lib/types'

export const prerender = false

export const load = async ({ fetch }) => {
	const response = await fetch('api/people')
	const posts: Person[] = await response.json()
	return {
		props: posts
	}
}
