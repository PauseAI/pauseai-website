/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Person } from '$lib/types.js'
import { defaultTitle } from '$lib/utils'
import { json } from '@sveltejs/kit'
import { fetchAllPages } from '$lib/airtable.js'

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
		org: 'International',
		checked: true
	},
	{
		id: 'fallback-stub2',
		name: '[FALLBACK DATA] Holdor',
		bio: 'Thrown at games',
		title: 'of Plays',
		image: 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback2',
		privacy: false,
		org: 'International',
		checked: true
	}
]

function recordToPerson(record: any): Person {
	return {
		id: record.id || 'noId',
		name: record.fields.Name,
		bio: record.fields.bio,
		title: record.fields.title || defaultTitle,
		image: record.fields.image && record.fields.image[0].thumbnails.large.url,
		privacy: record.fields.privacy,
		org: record.fields.organisation,
		checked: record.fields.checked
	}
}

const currentOrg = 'International'

const filter = (p: Person) => {
	return p.image && !p.privacy && p.checked && p.org?.includes(currentOrg)
}

export async function GET({ fetch, setHeaders }) {
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblZhQc49PkCz3yHd`
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
				organisation: person.org,
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
