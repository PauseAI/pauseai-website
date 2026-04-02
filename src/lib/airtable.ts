import { env } from '$env/dynamic/private'
import { getDevContext, isDev } from '$lib/env'
import Airtable, { type FieldSet, type Table } from 'airtable'

const getApiKey = () => env.AIRTABLE_API_KEY
const getWriteApiKey = () => env.AIRTABLE_WRITE_API_KEY || env.AIRTABLE_API_KEY

type QueryParams = Parameters<Table<FieldSet>['select']>[0]

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
 * @param _customFetch The fetch function
 * @param url The Airtable API URL
 * @param fallbackData Optional data to return if the fetch fails (only used in development mode)
 * @returns All records from all pages, or fallbackData if in development mode and fetch fails
 */
export async function fetchAllPages<T extends Record<string, unknown>>(
	_customFetch: typeof fetch,
	url: `https://api.airtable.com/v0/${string}/${string}`,
	fallbackData: AirtableRecord<T>[] = [],
	queryParams: QueryParams = undefined
): Promise<readonly AirtableRecord<T>[]> {
	const apiKey = getApiKey()
	if (!apiKey) {
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

		const base = new Airtable({ apiKey }).base(ids.baseId)
		const table = base(ids.tableId)

		const records = await table.select(queryParams).all()
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

/**
 * Creates a record in Airtable
 * @param baseId The Airtable Base ID
 * @param tableId The Airtable Table ID
 * @param fields The fields to create the record with
 */
export async function createRecord(
	baseId: string,
	tableId: string,
	fields: FieldSet
): Promise<void> {
	const apiKey = getWriteApiKey()
	if (!apiKey) {
		console.warn(`⚠️ Airtable API key not configured. Skipping record creation.`)
		return
	}

	try {
		const base = new Airtable({ apiKey }).base(baseId)
		const table = base(tableId)
		await table.create([{ fields }])
		console.log(`Successfully created record in Airtable table ${tableId}`)
	} catch (error) {
		console.error(`Error creating Airtable record in ${tableId}:`, error)
		// We don't throw here to avoid failing the whole request if Airtable is down
	}
}
