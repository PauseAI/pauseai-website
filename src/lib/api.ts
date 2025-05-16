import { AIRTABLE_API_KEY } from '$env/static/private'

/** Fetch options for getting data from Airtable */
export const options = {
	method: 'GET',
	headers: {
		Authorization: `Bearer ${AIRTABLE_API_KEY}`,
		'Content-Type': 'application/json'
	}
}

// Airtable API is limited to 100 items per page
export async function fetchAllPages(fetch: any, url: any) {
	let allRecords: any[] = []
	// https://airtable.com/developers/web/api/list-records#query-pagesize
	let offset

	do {
		const fullUrl = offset ? `${url}?offset=${offset}` : url
		const response = await fetch(fullUrl, options)
		if (!response.ok) {
			throw new Error('Failed to fetch data from Airtable')
		}
		const data: any = await response.json()
		allRecords = allRecords.concat(data.records)
		offset = data.offset
	} while (offset)

	return allRecords
}
