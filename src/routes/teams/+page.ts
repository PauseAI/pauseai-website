import type { Team } from '$lib/types'

export const prerender = true

export const load = async ({ fetch }) => {
	const response = await fetch('api/teams')
	const posts: Team[] = await response.json()
	return {
		props: posts
	}
}
