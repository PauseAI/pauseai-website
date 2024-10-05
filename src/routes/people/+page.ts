import type { Person } from '$lib/types'

export const prerender = false

export const load = async ({ fetch, setHeaders }) => {
	const response = await fetch('api/people')
	const people: Person[] = await response.json()
	const cacheControlHeader = response.headers.get('cache-control')
	if (cacheControlHeader) {
		setHeaders({
			'cache-control': cacheControlHeader
		})
	}
	return {
		people: people
	}
}
