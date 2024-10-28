import type { Person } from '$lib/types'
import { defaultTitle } from '$lib/utils'

export const prerender = false

export const load = async ({ fetch }) => {
	const response = await fetch('api/people')
	const people: Person[] = await response.json()
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
