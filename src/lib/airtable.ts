import { options } from '$lib/api.js'

/**
 * Fetches all pages from Airtable API (which is limited to 100 items per page)
 * @param fetch The fetch function
 * @param url The Airtable API URL
 * @param fallbackData Optional data to return if the fetch fails (only used in development mode)
 * @returns All records from all pages, or fallbackData if in development mode and fetch fails
 */
export async function fetchAllPages(fetch: any, url: any, fallbackData: any[] = []) {
	// Check if we're in development mode
	const isDevelopment = import.meta.env.MODE === 'development'

	let allRecords: any[] = []
	// https://airtable.com/developers/web/api/list-records#query-pagesize
	let offset

	// Check if we have the API key configured
	const apiKeyConfigured =
		options.headers.Authorization &&
		options.headers.Authorization !== 'Bearer undefined' &&
		options.headers.Authorization !== 'Bearer '

	// If API key is not configured
	if (!apiKeyConfigured) {
		if (isDevelopment) {
			console.warn('⚠️ Airtable API key not configured. Using fallback data in development mode.')
			return fallbackData
		} else {
			throw new Error('Airtable API key is required in production environment')
		}
	}

	try {
		do {
			const fullUrl = offset ? `${url}?offset=${offset}` : url
			console.log('Fetching from URL:', fullUrl)

			const response = await fetch(fullUrl, options)
			if (!response.ok) {
				const errorText = await response.text()
				console.error('Airtable API error:', response.status, response.statusText, errorText)

				if (isDevelopment && fallbackData.length > 0) {
					console.warn('⚠️ Using fallback data in development mode due to Airtable API error')
					return fallbackData
				}

				throw new Error(
					`Failed to fetch data from Airtable: ${response.statusText}. Details: ${errorText}`
				)
			}

			const data: any = await response.json()
			allRecords = allRecords.concat(data.records)
			offset = data.offset
		} while (offset)

		return allRecords
	} catch (error) {
		console.error('Error in fetchAllPages:', error)

		if (isDevelopment && fallbackData.length > 0) {
			console.warn('⚠️ Using fallback data in development mode due to error')
			return fallbackData
		}

		throw error
	}
}
