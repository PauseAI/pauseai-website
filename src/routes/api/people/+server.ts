/* eslint-disable @typescript-eslint/no-explicit-any */
import { options } from '$lib/api.js'
import type { Person } from '$lib/types.js'
import { error, json } from '@sveltejs/kit'

export const prerender = true

function airtableToCache(url: string): string {
	return `https://pauseai.info/.netlify/images?url=${url}`
}

function recordToPerson(record: any): Person {
	return {
		id: record.id || 'noId',
		name: record.fields.Name,
		bio: record.fields.bio,
		title: record.fields.title,
		image: record.fields.image && airtableToCache(record.fields.image[0].thumbnails.large.url),
		privacy: record.fields.privacy,
		org: record.fields.organisation,
		checked: record.fields.checked
	}
}

const currentOrg = 'International'

const filter = (p: Person) => {
	return p.image && !p.privacy && p.checked && p.org?.includes(currentOrg)
}

// Airtable API is limited to 100 items per page
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

export async function GET({ fetch, setHeaders }) {
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblZhQc49PkCz3yHd`

	try {
		const records = await fetchAllPages(fetch, url)
		const out: Person[] = records
			.map(recordToPerson)
			.filter(filter)
			// Shuffle the array, although not truly random
			.sort(() => 0.5 - Math.random())

		return json(out)
	} catch (e) {
		return error(500, 'err')
	}
}
