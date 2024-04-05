import type { Person } from '$lib/types'

export const load = async ({ fetch }) => {
	const response = await fetch('api/team')
	const posts: Person[] = await response.json()
	return {
		props: posts
	}
}
