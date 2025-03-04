import type { Team } from '$lib/types.js'
import { json, error } from '@sveltejs/kit'
import { options } from '$lib/api.js'
import { fetchAllPages } from '$lib/airtable.js'

/**
 * Converts an Airtable record to a Team object
 */
function recordToTeam(record: any): Team {
	return {
		id: record.id || 'noId',
		name: record.fields.name,
		description: record.fields.mission,
		leadName: record.fields.name_from_lead,
		leadEmail: record.fields.email_address_from_lead,
		responsibilities: record.fields.responsibilities_names || [],
		public: record.fields.public
	}
}

export async function GET({ fetch, setHeaders }) {
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblYLOPzJ32QOdBLg`
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})

	try {
		const records = await fetchAllPages(fetch, url)
		const out: Team[] = records.map(recordToTeam).filter((r: Team) => r.public)
		return json(out)
	} catch (e) {
		console.error('Error fetching teams:', e)
		return error(500, e instanceof Error ? e.message : 'Failed to fetch teams')
	}
}
