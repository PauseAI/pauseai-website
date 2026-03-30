export const prerender = false
import type { AboutApiResponse } from '$api/about/+server.js'
import { generateCacheControlRecord } from '$lib/utils.js'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, setHeaders }) => {
	const response = await fetch('/api/about')

	if (!response.ok) {
		console.error('Failed to load people data:', response.status, response.statusText)
		throw new Error(`Failed to load people data: ${response.statusText}`)
	}

	const groupedPeople = (await response.json()) as AboutApiResponse

	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))

	return {
		people: groupedPeople
	}
}
