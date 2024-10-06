import type { Person } from '$lib/types'

export const prerender = false

export const load = async ({ fetch, setHeaders }) => {
	const response = await fetch('api/people')
	const people: Person[] = await response.json()
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})
	return {
		people: people
	}
}
