/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Signatory } from '$lib/types.js'
import { json } from '@sveltejs/kit'
import { fetchAllPages } from '$lib/airtable.js'

/**
 * Fallback people data to use in development if Airtable fetch fails
 */
const fallbackSignatories: Signatory[] = [
	{
		name: 'Error',
		private: false,
		bio: 'So sorry',
		country: 'Sorry',
		date: new Date().toISOString()
	},
	{
		name: 'This should be',
		private: true,
		bio: 'This is a bio',
		country: 'United States',
		date: new Date().toISOString()
	}
]

function recordToSignatory(record: any): Signatory {
	return {
		private: record.fields.private || false,
		name: record.fields.private ? 'Anonymous' : record.fields.name, // Anonymize private signatories
		country: record.fields.country,
		bio: record.fields.bio,
		date: record.fields.created
	}
}

export async function GET({ fetch, setHeaders }) {
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tbl2emfOWNWoVz1kW`
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})

	try {
		// Fetch all records from Airtable
		const records = await fetchAllPages(fetch, url)

		// Filter to only include records where email_verified is explicitly true
		const verifiedRecords = records.filter((record) => {
			const emailVerified = record.fields.email_verified
			return emailVerified === true
		})

		console.log(`Total records: ${records.length}, Verified records: ${verifiedRecords.length}`)

		// Map the filtered records to signatories
		const signatories = verifiedRecords.map(recordToSignatory)

		// Sort signatories by date (oldest first)
		signatories.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

		// Return both the visible signatories and the total count
		return json({
			signatories: signatories,
			totalCount: signatories.length
		})
	} catch (e) {
		console.error('Error fetching signatories:', e)

		return json({
			signatories: fallbackSignatories,
			totalCount: 0
		})
	}
}
