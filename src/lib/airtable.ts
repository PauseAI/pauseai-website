import { options } from '$lib/api.js'

/**
 * Fetches all pages from Airtable API (which is limited to 100 items per page)
 * @param fetch The fetch function
 * @param url The Airtable API URL
 * @returns All records from all pages
 */
export async function fetchAllPages(fetch: any, url: any) {
	let allRecords: any[] = []
	// https://airtable.com/developers/web/api/list-records#query-pagesize
	let offset

	do {
		const fullUrl = offset ? `${url}?offset=${offset}` : url
		console.log('Fetching from URL:', fullUrl)

		try {
			const response = await fetch(fullUrl, options)
			if (!response.ok) {
				const errorText = await response.text()
				console.error('Airtable API error:', response.status, response.statusText, errorText)
				throw new Error(
					`Failed to fetch data from Airtable: ${response.statusText}. Details: ${errorText}`
				)
			}
			const data: any = await response.json()
			allRecords = allRecords.concat(data.records)
			offset = data.offset
		} catch (error) {
			console.error('Error in fetchAllPages:', error)
			throw error
		}
	} while (offset)

	return allRecords
}
