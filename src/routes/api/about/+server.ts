import { fetchNotionPeople } from '$lib/server/notion-people'
import type { Person } from '$lib/types'
import { generateCacheControlRecord } from '$lib/utils'
import { json } from '@sveltejs/kit'

// Export the response type for use in other endpoints
export type AboutApiResponse = Record<string, Person[]>

/**
 * Fallback people data to use in development if Notion fetch fails
 */
const fallbackPeople: Person[] = [
	{
		id: 'fallback-stub1',
		name: '[FALLBACK DATA] Example Person',
		bio: '',
		title: 'Placeholder',
		image: 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback1',
		privacy: false,
		checked: true,
		order: 1
	},
	{
		id: 'fallback-stub2',
		name: '[FALLBACK DATA] Holdor',
		bio: '',
		title: 'of Plays',
		image: 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback2',
		privacy: false,
		checked: true,
		order: 2
	}
]

const filter = (p: Person) => {
	return p.checked && !p.duplicate
}

const getGroupKey = (order: number | undefined): string => {
	// If order is missing or high default (e.g., 999), place in the lowest priority group
	const personOrder = order || 999

	if (personOrder <= 9) return 'Global Board'
	if (personOrder >= 10 && personOrder <= 29) return 'Leadership Team'
	if (personOrder >= 30) return 'National Chapters'

	// Fallback for missing/unassigned order (999 default)
	return 'National Chapter Leads'
}

export async function GET({ setHeaders }) {
	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))

	try {
		const people = await fetchNotionPeople()

		const sortedPeople = people
			.filter(filter)
			.sort((a, b) => {
				// Primary sort: numerical order field
				const orderA = a.order || 999
				const orderB = b.order || 999

				if (orderA !== orderB) {
					return orderA - orderB
				}

				// Secondary sort: alphabetical by name
				return a.name.localeCompare(b.name)
			})
			.map((p) => {
				if (p.privacy) {
					return {
						...p,
						name: p.name.split(' ')[0],
						image: undefined
					}
				}
				return p
			})

		const groupedOut: AboutApiResponse = sortedPeople.reduce(
			(acc, person) => {
				const key = getGroupKey(person.order)
				if (!acc[key]) {
					acc[key] = []
				}
				acc[key].push(person)
				return acc
			},
			{} as Record<string, Person[]>
		)

		return json(groupedOut)
	} catch (e) {
		console.error('Error fetching people:', e)

		const filteredFallback = fallbackPeople.filter(filter)

		const groupedFallback: AboutApiResponse = filteredFallback.reduce(
			(acc, person) => {
				const key = getGroupKey(person.order)
				if (!acc[key]) {
					acc[key] = []
				}
				acc[key].push(person)
				return acc
			},
			{} as Record<string, Person[]>
		)

		return json(groupedFallback)
	}
}
