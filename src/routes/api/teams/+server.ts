import type { AirtableTeam, Team } from '$lib/types.js'
import { json } from '@sveltejs/kit'
import { fetchAllPages, type AirtableRecord } from '$lib/airtable.js'

/**
 * Fallback teams data to use in development mode if Airtable fetch fails
 */
const FALLBACK_TEAMS: AirtableRecord<AirtableTeam>[] = [
	{
		id: 'fallback-stub1',
		fields: {
			name: '[FALLBACK DATA] Example Team 1',
			mission: 'This is placeholder data shown when Airtable API is unavailable.',
			name_from_lead: 'Placeholder Lead',
			email_address_from_lead: '',
			responsibilities_names: ['Placeholder Responsibility'],
			public: true
		}
	},
	{
		id: 'fallback-stub2',
		fields: {
			name: '[FALLBACK DATA] Example Team 2',
			mission: 'This is placeholder data shown when Airtable API is unavailable.',
			name_from_lead: 'Placeholder Lead',
			email_address_from_lead: '',
			responsibilities_names: ['Placeholder Responsibility'],
			public: true
		}
	}
]

/**
 * Converts an Airtable record to a Team object
 */
function recordToTeam(record: AirtableRecord<AirtableTeam>): Team {
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
		const records = await fetchAllPages<AirtableTeam>(fetch, url, FALLBACK_TEAMS)
		const out: Team[] = records.map(recordToTeam).filter((r: Team) => r.public)
		return json(out)
	} catch (e) {
		console.error('Error fetching teams:', e)
		// Return fallback data instead of error
		return json(FALLBACK_TEAMS.map(recordToTeam).filter((r: Team) => r.public))
	}
}
