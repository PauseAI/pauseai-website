import type { AirtableSignatory, Signatory } from '$lib/types.js'
import { json } from '@sveltejs/kit'
import { fetchAllPages, type AirtableRecord } from '$lib/airtable.js'
import { normaliseEmail } from '$lib/server/emailVerification'
import { MEMBERS_BASE_ID, STATEMENT_TABLE_ID } from '$lib/server/members'
import { generateCacheControlRecord } from '$lib/utils'
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

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
	const url = `https://api.airtable.com/v0/${MEMBERS_BASE_ID}/${STATEMENT_TABLE_ID}` as const
	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))

	try {
		// Fetch all records from Airtable
		const records = await fetchAllPages<AirtableSignatory>(fetch, url)

		// Only rows whose email_verified is explicitly true. The automation ticks `duplicate` on
		// any later row for an address, even when it's the only verified one or asks to be
		// anonymous, so rows with an address are left for earliestRowPerAddress to settle.
		// Without an address there is nothing to match on, so `duplicate` still decides.
		const verifiedRecords = records.filter((record) => {
			const { email_verified: emailVerified, duplicate, email } = record.fields
			return emailVerified === true && (!duplicate || !!email)
		})

		console.log(`Total records: ${records.length}, Verified records: ${verifiedRecords.length}`)

		const signatories = earliestRowPerAddress(verifiedRecords).map(recordToSignatory)

		// Return both the visible signatories and the total count
		const response: SignatoriesApiResponse = {
			signatories: signatories,
			totalCount: signatories.length
		}
		return json(response)
	} catch (e) {
		console.error('Error fetching signatories:', e)

		const response: SignatoriesApiResponse = {
			signatories: fallbackSignatories,
			totalCount: 0
		}
		return json(response)
	}
}
