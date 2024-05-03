import { AIRTABLE_API_KEY } from '$env/static/private'

if (!AIRTABLE_API_KEY && import.meta.env.MODE == 'production') {
	throw new Error('AIRTABLE_API_KEY is missing from .env')
}

/** Fetch options for getting data from Airtable */
export const options = {
	method: 'GET',
	headers: {
		Authorization: `Bearer ${AIRTABLE_API_KEY}`,
		'Content-Type': 'application/json'
	}
}
