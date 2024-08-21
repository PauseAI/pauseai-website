import { options } from '$lib/api.js'
import type { Person } from '$lib/types.js'
import { error, json } from '@sveltejs/kit'

function recordToPerson(record: any): Person {
	return {
		id: record.id || 'noId',
		name: record.fields.Name,
		bio: record.fields.bio,
		title: record.fields.title,
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

async function fetchAllPages(fetch: any, url: any) {
	let allRecords: any[] = []
	// https://airtable.com/developers/web/api/list-records#query-pagesize
	let offset

	do {
		const fullUrl = offset ? `${url}?offset=${offset}` : url
		const response = await fetch(fullUrl, options)
		if (!response.ok) {
			throw new Error('Failed to fetch data from Airtable')
		}
		const data: any = await response.json()
		allRecords = allRecords.concat(data.records)
		offset = data.offset
	} while (offset)

	return allRecords
}

export async function GET({ fetch }) {
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblZhQc49PkCz3yHd`

	try {
		const records = await fetchAllPages(fetch, url)
		console.log('data len', records.length)
		const out: Person[] = records
			.map(recordToPerson)
			.filter(filter)
			// Shuffle the array, although not truly random
			.sort(() => 0.5 - Math.random())
		console.log('out', out.length)
		return json(out)
	} catch (e) {
		console.log('err while transforming airtable data', e)
		return error(500, 'err')
	}
}
