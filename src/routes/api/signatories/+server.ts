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
    const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tbl2emfOWNWoVz1kW`;
    setHeaders({
        'cache-control': 'public, max-age=3600' // 1 hour in seconds
    });

    try {
        // Fetch all records from Airtable
        const records = await fetchAllPages(fetch, url);
        const signatories = records.map(recordToSignatory);

        // Calculate total count before filtering
        const totalCount = signatories.length;

        // Filter out private signatories
        const visibleSignatories = signatories.filter(filter);

        // Return both the visible signatories and the total count
        return json({
            signatories: visibleSignatories,
            totalCount
        });
    } catch (e) {
        console.error('Error fetching signatories:', e);

        // Fallback logic
        const totalCount = fallbackSignatories.length;
        const visibleSignatories = fallbackSignatories.filter(filter);

        return json({
            signatories: visibleSignatories,
            totalCount
        });
    }
}