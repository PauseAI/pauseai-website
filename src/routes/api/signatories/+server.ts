/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Signatory } from '$lib/types.js'
import { json } from '@sveltejs/kit'
import { fetchAllPages } from '$lib/airtable.js'

/**
 * Fallback people data to use in development if Airtable fetch fails
 */
const fallbackSignatories: Signatory[] = [
	{
		first_name: 'Error',
		last_name: 'Happened',
		private: false,
		bio: 'So sorry',
		country: 'Sorry'
	},
	{
		first_name: 'This should be',
		last_name: 'Private',
		private: true,
		bio: 'This is a bio',
		country: 'United States'
	}
]

function recordToSignatory(record: any): Signatory {
	console.log('record', record)
	return {
		first_name: record.fields.first_name,
		last_name: record.fields.last_name,
		private: record.fields.private || false,
		country: record.fields.country,
		bio: record.fields.bio
	}
}

const filter = (p: Signatory) => {
	return !p.private
}

export async function GET({ fetch, setHeaders }) {
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tbl2emfOWNWoVz1kW`
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})

	try {
		// Create fallback records in the expected Airtable format
		// const fallbackRecords = fallbackSignatories.map(recordToSignatory)

		const records = await fetchAllPages(fetch, url)
		const out: Signatory[] = records
			.map(recordToSignatory)
			.filter(filter)
			// Shuffle the array, although not truly random
			.sort(() => 0.5 - Math.random())
		return json(out)
	} catch (e) {
		console.error('Error fetching signatories:', e)
		// Return fallback data instead of error
		return json(fallbackSignatories.filter(filter))
	}
}
