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
		country: 'Sorry'
	},
	{
		name: 'This should be',
		private: true,
		bio: 'This is a bio',
		country: 'United States'
	}
]

function recordToSignatory(record: any): Signatory {
	console.log('record', record)
	return {
        private: record.fields.private || false,
        name: record.fields.private ? "Anonymous" : record.fields.name, // Anonymize private signatories
		country: record.fields.country,
		bio: record.fields.bio,
        date: record.fields.created
	}
}

export async function GET({ fetch, setHeaders }) {
    const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tbl2emfOWNWoVz1kW`;
    setHeaders({
        'cache-control': 'public, max-age=3600' // 1 hour in seconds
    });

    try {
        // Fetch all records from Airtable
        const records = await fetchAllPages(fetch, url);
        const signatories = records.map(recordToSignatory);

        // Sort signatories by date (newest first)
        signatories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Calculate total count before filtering
        const totalCount = signatories.length;

        // Return both the visible signatories and the total count
        return json({
            signatories: signatories,
            totalCount
        });
    } catch (e) {
        console.error('Error fetching signatories:', e);

        return json({
            signatories: fallbackSignatories,
            totalCount: 0
        });
    }
}