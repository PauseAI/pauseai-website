import { env } from '$env/dynamic/private'
import { getDevContext, isDev } from '$lib/env.server'
import { reportError } from '$lib/server/sentry'
import Airtable, { type FieldSet, type Table } from 'airtable'

const getApiKey = () => env.AIRTABLE_API_KEY
const getWriteApiKey = () => env.AIRTABLE_WRITE_API_KEY || env.AIRTABLE_API_KEY

type QueryParams = Parameters<Table<FieldSet>['select']>[0]

const AIRTABLE_URL_REGEX = /^https:\/\/api\.airtable\.com\/v0\/(?<baseId>\w+)\/(?<tableId>\w+)\/?$/

export type AirtableRecord<T> = {
	id: string
	fields: T
}

// A record as Airtable answered a write: the whole stored row, not only the
// fields the write sent. CRM intake forwards it as is.
export type WrittenRecord = AirtableRecord<FieldSet> & { createdTime: string }

const toWrittenRecord = (record: Airtable.Record<FieldSet>): WrittenRecord => ({
	id: record.id,
	createdTime: (record._rawJson as { createdTime: string }).createdTime,
	fields: record.fields
})

export type AirtableListResponse<T> = {
	records: AirtableRecord<T>[]
}

/**
 * Extracts base ID and table ID from an Airtable URL
 * @param url The Airtable API URL
 * @returns Object containing baseId and tableId, or null if URL is invalid
 */
function extractAirtableIds(url: string): { baseId: string; tableId: string } | null {
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
 * A value as a double-quoted string for an Airtable formula. Everything put into a formula
 * from outside goes through this, however it was validated, so that a change to validation
 * cannot turn into a formula injection.
 */
export function airtableFormulaString(value: string): string {
	const escaped = value
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\"')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/\t/g, '\\t')
		.replace(/\p{Cc}/gu, '')
	return `"${escaped}"`
}

/** An error carrying only the code and status of an Airtable error, not its message. */
function redactedAirtableError(error: unknown, operation: 'read' | 'write'): Error {
	const { error: code, statusCode } = (error ?? {}) as { error?: unknown; statusCode?: unknown }
	const safeCode = typeof code === 'string' && /^[A-Z_]+$/.test(code) ? code : 'UNKNOWN'
	const safeStatus = typeof statusCode === 'number' ? statusCode : 'unknown'
	return new Error(`Airtable ${operation} failed: ${safeCode} (status ${safeStatus})`)
}

/**
 * Creates a record in Airtable
 * @param baseId The Airtable Base ID
 * @param tableId The Airtable Table ID
 * @param fields The fields to create the record with
 * @param options.redactErrors Log and report only Airtable's error code and status. For
 * rows holding personal data, since Airtable's error messages can quote submitted values.
 * @returns The created record, or undefined if the write failed
 */
export async function createRecord(
	baseId: string,
	tableId: string,
	fields: FieldSet,
	{ redactErrors = false }: { redactErrors?: boolean } = {}
): Promise<WrittenRecord | undefined> {
	const apiKey = getWriteApiKey()
	if (!apiKey) {
		console.warn(`⚠️ Airtable API key not configured. Skipping record creation.`)
		return undefined
	}

	try {
		const base = new Airtable({ apiKey }).base(baseId)
		const table = base(tableId)
		// typecast lets Airtable coerce strings and create missing select
		// options; callers are expected to validate values before writing.
		const records = await table.create([{ fields }], { typecast: true })
		console.log(`Successfully created record in Airtable table ${tableId}`)
		return records[0] && toWrittenRecord(records[0])
	} catch (caught) {
		const error = redactErrors ? redactedAirtableError(caught, 'write') : caught
		console.error(`Error creating Airtable record in ${tableId}:`, error)
		// Report to Sentry even though we swallow the error: the caller surfaces
		// a generic "could not save" message via `fail()`, which never reaches
		// `handleError`, so without this the outage would be invisible.
		await reportError(error, { tableId, operation: 'createRecord' })
		// We don't throw here to avoid failing the whole request if Airtable is down
		return undefined
	}
}

/**
 * Whether any record matches a formula, with the write key. For lookups by personal data:
 * neither the formula nor Airtable's message, which can quote it, reaches a log or a report.
 * @param formula Build it with airtableFormulaString for anything from outside
 * @param field A field to fetch: Airtable answers with every field if none is named, and
 * this only needs to know a row exists, so name one that isn't personal
 * @returns 'failed' when the lookup could not be made, or the key is not configured
 */
export async function hasMatchingRecord(
	baseId: string,
	tableId: string,
	formula: string,
	field: string
): Promise<boolean | 'failed'> {
	const apiKey = getWriteApiKey()
	if (!apiKey) {
		console.warn(`⚠️ Airtable API key not configured. Skipping record lookup.`)
		return 'failed'
	}

	try {
		const records = await new Airtable({ apiKey })
			.base(baseId)(tableId)
			.select({ filterByFormula: formula, maxRecords: 1, fields: [field] })
			.firstPage()
		return records.length > 0
	} catch (caught) {
		const error = redactedAirtableError(caught, 'read')
		console.error(`Error looking up Airtable record in ${tableId}:`, error)
		await reportError(error, { tableId, operation: 'hasMatchingRecord' })
		return 'failed'
	}
}

/**
 * Reads one record's fields, with the write key (`/api/verify` reads the Members
 * table with it too)
 * @returns 'missing' when no record has that id (never existed, or deleted),
 * which a caller can act on, unlike an outage ('failed')
 */
export async function getRecord(
	baseId: string,
	tableId: string,
	recordId: string
): Promise<FieldSet | 'missing' | 'failed'> {
	const apiKey = getWriteApiKey()
	if (!apiKey) {
		console.warn(`⚠️ Airtable API key not configured. Skipping record read.`)
		return 'failed'
	}

	try {
		const record = await new Airtable({ apiKey }).base(baseId)(tableId).find(recordId)
		return record.fields
	} catch (error) {
		if ((error as { error?: unknown } | null)?.error === 'NOT_FOUND') {
			console.warn(`Airtable record ${recordId} in ${tableId} does not exist`)
			return 'missing'
		}
		console.error(`Error reading Airtable record ${recordId} in ${tableId}:`, error)
		await reportError(error, { tableId, recordId, operation: 'getRecord' })
		return 'failed'
	}
}

/**
 * Updates an existing record in Airtable
 * @param baseId The Airtable Base ID
 * @param tableId The Airtable Table ID
 * @param recordId The id of the record to update
 * @param fields The fields to update on the record
 * @returns The updated record, or 'missing' when no record has that id (never
 * existed, or deleted), which a caller can act on, unlike an outage ('failed')
 */
export async function updateRecord(
	baseId: string,
	tableId: string,
	recordId: string,
	fields: FieldSet
): Promise<WrittenRecord | 'missing' | 'failed'> {
	const apiKey = getWriteApiKey()
	if (!apiKey) {
		console.warn(`⚠️ Airtable API key not configured. Skipping record update.`)
		return 'failed'
	}

	try {
		const base = new Airtable({ apiKey }).base(baseId)
		const table = base(tableId)
		const records = await table.update([{ id: recordId, fields }], { typecast: true })
		console.log(`Successfully updated record ${recordId} in Airtable table ${tableId}`)
		return toWrittenRecord(records[0])
	} catch (error) {
		// Airtable answers 422 ROW_DOES_NOT_EXIST for an id that never existed and
		// for a deleted one alike. Not an outage, so not reported.
		if ((error as { error?: unknown } | null)?.error === 'ROW_DOES_NOT_EXIST') {
			console.warn(`Airtable record ${recordId} in ${tableId} does not exist`)
			return 'missing'
		}
		console.error(`Error updating Airtable record ${recordId} in ${tableId}:`, error)
		// Report to Sentry even though we swallow the error: the caller surfaces
		// a generic "could not save" message via `fail()`, which never reaches
		// `handleError`, so without this the outage would be invisible.
		await reportError(error, { tableId, recordId, operation: 'updateRecord' })
		// We don't throw here to avoid failing the whole request if Airtable is down;
		// the caller decides whether to surface the failure to the user.
		return 'failed'
	}
}
