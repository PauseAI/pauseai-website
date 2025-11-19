/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Person } from '$lib/types'
import { defaultTitle } from '$lib/config'
import { json } from '@sveltejs/kit'
import { fetchAllPages } from '$lib/airtable'

const TYPE_ORDER = ['Global Board', 'Global Leadership', 'National Chapter Leads'] //0-9, 10-29, 30+

/**
 * Fallback people data to use in development if Airtable fetch fails
 */
const fallbackPeople: Person[] = [
	{
		id: 'fallback-stub1',
		name: '[FALLBACK DATA] Example Person',
		bio: 'I hold places when Airtable API is unavailable.',
		title: 'Placeholder',
		image: 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback1',
		privacy: false,
		checked: true,
		order: 1
	},
	{
		id: 'fallback-stub2',
		name: '[FALLBACK DATA] Holdor',
		bio: 'Thrown at games',
		title: 'of Plays',
		image: 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback2',
		privacy: false,
		checked: true,
		order: 2
	}
]

function recordToPerson(record: any): Person {
	return {
		id: record.id || 'noId',
		name: record.fields['Full name'],
		bio: record.fields.Bio2,
		title: record.fields.Title || defaultTitle,
		image: record.fields.Photo && record.fields.Photo[0].thumbnails.large.url,
		privacy: record.fields.Privacy,
		checked: record.fields.About,
		duplicate: record.fields.duplicate,
		order: record.fields['About order'] || 999
	}
}

const filter = (p: Person) => {
	return (
		p.image &&
		!p.privacy &&
		p.checked &&
		p.title?.trim() !== '' &&
		p.title !== defaultTitle &&
		!p.duplicate
	)
}

const getGroupKey = (order: number | undefined): string => {
	// If order is missing or high default (e.g., 999), place in the lowest priority group
	const personOrder = order || 999

	if (personOrder <= 9) return 'Global Board'
	if (personOrder >= 10 && personOrder <= 29) return 'Global Leadership'
	if (personOrder >= 30) return 'National Chapter Leads'

	// Fallback for missing/unassigned order (999 default)
	return 'National Chapter Leads'
}

export async function GET({ fetch, setHeaders }) {
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblL1icZBhTV1gQ9o`
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})

	try {
		// Create fallback records in the expected Airtable format
		const fallbackRecords = fallbackPeople.map((person) => ({
			id: person.id,
			fields: {
				// These keys MUST match what recordToPerson expects
				'Full name': person.name,
				Bio2: person.bio,
				Title: person.title,
				Photo: [{ thumbnails: { large: { url: person.image } } }],
				Privacy: person.privacy,
				About: person.checked, // Assuming 'About' maps to checked based on your code
				'About order': person.order || 999
			}
		}))

		const records = await fetchAllPages(fetch, url, fallbackRecords)

		const sortedPeople = records
			.map(recordToPerson)
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

		const groupedOut = sortedPeople.reduce(
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

		const groupedFallback = filteredFallback.reduce(
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
