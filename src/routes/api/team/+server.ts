import { env } from '$env/dynamic/private'
import type { Person } from '$lib/types.js'
import { json } from '@sveltejs/kit'

function recordToPerson(record: any): Person {
	console.log('record', record.fields)
	return {
		id: record.id || 'noId',
		name: record.fields.Name
	}
}

export async function GET({ fetch }) {
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblZhQc49PkCz3yHd`
	const options = {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
			'Content-Type': 'application/json'
		}
	}

	const response = await fetch(url, options)
	if (!response.ok) {
		throw new Error('Failed to fetch data from Airtable')
	}
	const data = await response.json()
	const out = data.records.map(recordToPerson)
	return json(out)
}
