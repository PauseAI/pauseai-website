import { dev } from '$app/environment'
import type { AirtableSignatory, Signatory } from '$lib/types.js'
import { error, json } from '@sveltejs/kit'
import { fetchAllPages, type AirtableRecord } from '$lib/airtable.js'
import { normaliseEmail } from '$lib/server/emailVerification'
import { MEMBERS_BASE_ID, STATEMENT_TABLE_ID } from '$lib/server/members'
import { publicListFromCrm, statementBackend } from '$lib/server/statementCrm'
import { generateCacheControlRecord } from '$lib/utils'
import { StatusCodes } from 'http-status-codes'
import type { RequestHandler } from './$types'

/**
 * Fallback people data to use in development if Airtable fetch fails
 */
const fallbackSignatories: Signatory[] = [
	{
		name: 'Error',
		private: false,
		bio: 'So sorry',
		country: 'Sorry',
		date: new Date().toISOString()
	},
	{
		name: 'This should be',
		private: true,
		bio: 'This is a bio',
		country: 'United States',
		date: new Date().toISOString()
	}
]

export type SignatoriesApiResponse = {
	signatories: Signatory[]
	totalCount: number
}

function recordToSignatory(record: AirtableRecord<AirtableSignatory>): Signatory {
	return {
		private: record.fields.private || false,
		name: record.fields.private ? 'Anonymous' : record.fields.name, // Anonymize private signatories
		country: record.fields.country,
		bio: record.fields.bio,
		date: record.fields.date
	}
}

const dateValue = (record: AirtableRecord<AirtableSignatory>) => {
	const time = new Date(record.fields.date).getTime()
	return Number.isNaN(time) ? Infinity : time
}

/**
 * Oldest first, with one row per address, since nothing else stops a verified address having
 * two rows: the signing path only skips repeats within a window, and Tally never did. The
 * earliest row stands, but stays anonymous if any of the address's rows asked to be.
 */
function earliestRowPerAddress(
	records: readonly AirtableRecord<AirtableSignatory>[]
): AirtableRecord<AirtableSignatory>[] {
	const byAddress = new Map<string, AirtableRecord<AirtableSignatory>>()
	for (const record of [...records].sort((a, b) => dateValue(a) - dateValue(b))) {
		const key = record.fields.email ? normaliseEmail(record.fields.email) : record.id
		const earlier = byAddress.get(key)
		if (!earlier) byAddress.set(key, record)
		else if (record.fields.private) {
			byAddress.set(key, { ...earlier, fields: { ...earlier.fields, private: true } })
		}
	}
	return [...byAddress.values()]
}

const SIGNATORY_FIELDS: (keyof AirtableSignatory)[] = [
	'name',
	'email',
	'private',
	'bio',
	'country',
	'date',
	'email_verified',
	'duplicate'
]

const failedList: SignatoriesApiResponse = { signatories: fallbackSignatories, totalCount: 0 }

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
	const url = `https://api.airtable.com/v0/${MEMBERS_BASE_ID}/${STATEMENT_TABLE_ID}` as const
	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))

	// CiviCRM applies the listing rules itself (verified, not hidden, one row per person and
	// name, private ones as "Anonymous") and answers in this route's shape.
	if (statementBackend() === 'civicrm') {
		const list = await publicListFromCrm()
		if (list) return json(list)
		// This answer is prerendered and published until the next deploy, so outside the dev
		// server a failure must fail the build (svelte.config.js), not publish an empty list.
		if (!dev) error(StatusCodes.SERVICE_UNAVAILABLE, 'The signatory list could not be read')
		return json(failedList)
	}

	try {
		const records = await fetchAllPages<AirtableSignatory>(fetch, url, [], {
			filterByFormula: '{email_verified}',
			fields: SIGNATORY_FIELDS
		})

		// The automation's `duplicate` tick can land on an address's only verified row, so rows
		// with an address are left to earliestRowPerAddress.
		const verifiedRecords = records.filter((record) => {
			const { email_verified: emailVerified, duplicate, email } = record.fields
			const listable = !duplicate || !!email
			return emailVerified === true && listable
		})

		console.log(`Verified records: ${records.length}, listable: ${verifiedRecords.length}`)

		const signatories = earliestRowPerAddress(verifiedRecords).map(recordToSignatory)

		// Return both the visible signatories and the total count
		const response: SignatoriesApiResponse = {
			signatories: signatories,
			totalCount: signatories.length
		}
		return json(response)
	} catch (e) {
		console.error('Error fetching signatories:', e)

		return json(failedList)
	}
}
