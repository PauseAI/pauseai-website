export const prerender = false
import type { Person } from '$lib/types'
import { generateCacheControlRecord } from '$lib/utils.js'

export const load = async ({ fetch, setHeaders }) => {
	const response = await fetch('/api/about')

	if (!response.ok) {
		console.error('Failed to load people data:', response.status, response.statusText)
		throw new Error(`Failed to load people data: ${response.statusText}`)
	}

	const groupedPeople = (await response.json()) as Record<string, Person[]>

	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))

	return {
		people: groupedPeople
	}
}
