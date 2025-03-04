/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Person } from '$lib/types.js'
import { defaultTitle } from '$lib/utils'
import { error, json } from '@sveltejs/kit'
import { fetchAllPages } from '$lib/airtable.js'

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
		const records = await fetchAllPages(fetch, url)
		const out: Person[] = records
			.map(recordToPerson)
			.filter(filter)
			// Shuffle the array, although not truly random
			.sort(() => 0.5 - Math.random())
		return json(out)
	} catch (e) {
		console.error('Error fetching people:', e)
		return error(500, e instanceof Error ? e.message : 'Failed to fetch people')
	}
}
