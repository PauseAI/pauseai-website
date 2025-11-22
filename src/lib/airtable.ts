import { AIRTABLE_API_KEY } from '$env/static/private'
import { getDevContext, isDev } from '$lib/env'
import Airtable from 'airtable'

/** Fetch options for getting data from Airtable */
const OPTIONS = {
	method: 'GET',
	headers: {
		Authorization: `Bearer ${AIRTABLE_API_KEY}`,
		'Content-Type': 'application/json'
	}
}

const AIRTABLE_URL_REGEX =
	/^https:\/\/api\.airtable\.com\/v0\/(?<baseId>(\w|\d)+)\/(?<tableId>(\w|\d)+)\/?$/

export type AirtableRecord<T> = {
	id: string
	fields: T
}

/**
 * Extracts base ID and table ID from an Airtable URL
 * @param url The Airtable API URL
 * @returns Object containing baseId and tableId, or null if URL is invalid
 */
export function extractAirtableIds(url: string): { baseId: string; tableId: string } | null {
	const match = url.match(AIRTABLE_URL_REGEX)
	if (!match || !match.groups) return null

	return {
		baseId: match.groups.baseId,
		tableId: match.groups.tableId
	}
}

/**
 * Fetches all pages from Airtable API (which is limited to 100 items per page)
 * @template T The type of the records' fields
 * @param customFetch The fetch function
 * @param url The Airtable API URL
 * @param fallbackData Optional data to return if the fetch fails (only used in development mode)
 * @returns All records from all pages, or fallbackData if in development mode and fetch fails
 */
export async function fetchAllPages<T extends Record<string, unknown>>(
	customFetch: typeof fetch,
	url: `https://api.airtable.com/v0/${string}/${string}`,
	fallbackData: AirtableRecord<T>[] = []
): Promise<readonly AirtableRecord<T>[]> {
	// Check if we have the API key configured
	const apiKeyConfigured =
		OPTIONS.headers.Authorization &&
		OPTIONS.headers.Authorization !== 'Bearer undefined' &&
		OPTIONS.headers.Authorization !== 'Bearer '

	// If API key is not configured
	if (!apiKeyConfigured) {
		console.warn(`⚠️ Airtable API key not configured in ${getDevContext()}`)
		if (isDev()) {
			console.log('...but using fallback data in development mode.')
			return fallbackData
		} else {
			throw new Error('Airtable API key is required in production')
		}
	}

	try {
		// Try to use Airtable SDK if available
		const ids = extractAirtableIds(url)
		if (!ids) throw new Error('Invalid Airtable API URL: ' + url)
		if (isDev()) console.log('Using Airtable SDK for:', url)

		const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(ids.baseId)
		const table = base(ids.tableId)

		const records = await table.select().all()
		return records.map((record) => ({ id: record.id, fields: record.fields as T }))
	} catch (error) {
		console.error('Error in fetchAllPages:', error)

		if (isDev() && fallbackData.length > 0) {
			console.warn('⚠️ Using fallback data in development mode due to error')
			return fallbackData
		}

		throw error
	}
}
