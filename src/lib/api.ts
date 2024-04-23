import { AIRTABLE_API_KEY } from '$env/static/private'

/** Fetch options for getting data from Airtable */
export const options = {
	method: 'GET',
	headers: {
		Authorization: `Bearer ${AIRTABLE_API_KEY}`,
		'Content-Type': 'application/json'
	}
}
