import { AIRTABLE_API_KEY } from '$env/static/private'
import { options } from '$lib/api.js'
import type { Person } from '$lib/types.js'
import { json } from '@sveltejs/kit'

function recordToPerson(record: any): Person {
	return {
		id: record.id || 'noId',
		name: record.fields.Name,
		bio: record.fields.Bio,
		title: record.fields.Title,
		image: record.fields.Image && record.fields.Image[0].thumbnails.large.url
	}
}

export async function GET({ fetch }) {
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblZhQc49PkCz3yHd`

	const response = await fetch(url, options)
	if (!response.ok) {
		throw new Error('Failed to fetch data from Airtable')
	}
	const data = await response.json()
	const out: Person[] = data.records
		.map(recordToPerson)
		.filter((p: Person) => p.image)
		// Shuffle the array, although not truly random
		.sort(() => 0.5 - Math.random())
	return json(out)
}
