import type { Person } from '$lib/types'
import { defaultTitle } from '$lib/utils'

export const prerender = false

export const load = async ({ fetch, setHeaders }) => {
	const response = await fetch('api/people')
	const people: Person[] = await response.json()
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})
	// sort people, those who dont have "Volunteer" as title should be at the top
	people.sort((a, b) => {
		if (a.title === defaultTitle && b.title !== defaultTitle) return 1
		if (a.title !== defaultTitle && b.title === defaultTitle) return -1
		return 0
	})
	return {
		people: people
	}
}
