import type { Person } from '$lib/types'

/** Airtable image links need to be refreshed every 2 hours */
export const prerender = false

export const load = async ({ fetch, setHeaders }) => {
	const response = await fetch('api/people')
	const people: Person[] = await response.json()

	setHeaders({
		// AirTable image URLs only live for 2 hrs
		'Cache-Control': 'public, max-age=60'
	})

	return {
		people: people,
		maxage: 60
	}
}
