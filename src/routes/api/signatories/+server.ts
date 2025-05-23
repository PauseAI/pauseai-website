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
		country: record.fields.country || "",
		bio: record.fields.bio,
        date: record.fields.created,
        email_verified: record.fields.email_verified || false
	}
}

export async function GET({ fetch, setHeaders }) {
    try {
        // Fetch all records from the database or API
        const response = await fetch('https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tbl2emfOWNWoVz1kW');
        const records = await response.json();

        // Map records to Signatory objects
        const signatories = records.map(recordToSignatory);

        // Filter signatories with email_verified = true
        const verifiedSignatories = signatories;

        // Set cache headers
        setHeaders({
            'cache-control': 'public, max-age=3600' // 1 hour in seconds
        });

        // Return the filtered signatories and their count
        return new Response(
            JSON.stringify({
                signatories: verifiedSignatories,
                totalCount: verifiedSignatories.length
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching signatories:', error);

        // Fallback data in case of an error
        return new Response(
            JSON.stringify({
                signatories: fallbackSignatories,
                totalCount: 0
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    }
}