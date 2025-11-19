import type { Person } from '$lib/types'

export const load = async ({ fetch, setHeaders }) => {
	const response = await fetch('/api/people')

	if (!response.ok) {
		console.error('Failed to load people data:', response.status, response.statusText)
		throw new Error(`Failed to load people data: ${response.statusText}`)
	}

	const groupedPeople = (await response.json()) as Record<string, Person[]>

	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})

	return {
		people: groupedPeople
	}
}
