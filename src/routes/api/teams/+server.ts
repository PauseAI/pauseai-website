import type { Team } from '$lib/types.js'
import { json } from '@sveltejs/kit'
import { options } from '$lib/api.js'

function recordToTeam(record: any): Team {
	console.log(record.fields)
	return {
		id: record.id || 'noId',
		name: record.fields.Name,
		description: record.fields.Mission,
		lead: record.fields['Name (from Lead)']
	}
}

export async function GET({ fetch }) {
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblYLOPzJ32QOdBLg`

	const response = await fetch(url, options)
	if (!response.ok) {
		throw new Error('Failed to fetch data from Airtable')
	}
	const data = await response.json()
	const out: Team[] = data.records.map(recordToTeam)
	return json(out)
}
