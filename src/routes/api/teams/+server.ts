import type { Team } from '$lib/types.js'
import { json } from '@sveltejs/kit'
import { fetchAllPages } from '$lib/airtable.js'

/**
 * Fallback teams data to use in development mode if Airtable fetch fails
 */
const fallbackTeams = [
	{
		id: 'fallback-stub1',
		name: '[FALLBACK DATA] Example Team 1',
		description: 'This is placeholder data shown when Airtable API is unavailable.',
		leadName: 'Placeholder Lead',
		leadEmail: '',
		responsibilities: ['Placeholder Responsibility'],
		public: true
	},
	{
		id: 'fallback-stub2',
		name: '[FALLBACK DATA] Example Team 2',
		description: 'This is placeholder data shown when Airtable API is unavailable.',
		leadName: 'Placeholder Lead',
		leadEmail: '',
		responsibilities: ['Placeholder Responsibility'],
		public: true
	}
]

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
		// Pass fallback data to the fetch function
		const fallbackRecords = fallbackTeams.map((team) => ({
			id: team.id,
			fields: {
				name: team.name,
				mission: team.description,
				name_from_lead: team.leadName,
				email_address_from_lead: team.leadEmail,
				responsibilities_names: team.responsibilities,
				public: team.public
			}
		}))

		const records = await fetchAllPages(fetch, url, fallbackRecords)
		const out: Team[] = records.map(recordToTeam).filter((r: Team) => r.public)
		return json(out)
	} catch (e) {
		console.error('Error fetching teams:', e)
		// Return fallback data instead of error
		return json(fallbackTeams)
	}
}
