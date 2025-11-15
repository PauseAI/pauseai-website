/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Person } from '$lib/types'
import { defaultTitle } from '$lib/config'
import { json } from '@sveltejs/kit'
import { fetchAllPages } from '$lib/airtable'

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
		checked: true
	},
	{
		id: 'fallback-stub2',
		name: '[FALLBACK DATA] Holdor',
		bio: 'Thrown at games',
		title: 'of Plays',
		image: 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback2',
		privacy: false,
		checked: true
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
		duplicate: record.fields.duplicate
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
				Name: person.name,
				bio: person.bio,
				title: person.title,
				image: [{ thumbnails: { large: { url: person.image } } }],
				privacy: person.privacy,
				checked: person.checked
			}
		}))

		const records = await fetchAllPages(fetch, url, fallbackRecords)
		const out: Person[] = records
			.map(recordToPerson)
			.filter(filter)
			// Shuffle the array, although not truly random
			.sort(() => 0.5 - Math.random())
		return json(out)
	} catch (e) {
		console.error('Error fetching people:', e)
		// Return fallback data instead of error
		return json(fallbackPeople.filter(filter))
	}
}
