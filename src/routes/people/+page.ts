import type { Person } from '$lib/types'

/** Airtable image links need to be refreshed every 2 hours */
export const prerender = true

export const load = async ({ fetch }) => {
	const response = await fetch('api/people')
	const people: Person[] = await response.json()

	return {
		people: people,
		maxage: 60
	}
}
