import { parse } from 'csv-parse/sync'
import mpData from '../../../data/uk-mps.csv?raw'

export interface MP {
	email: string
	name: string
	salutation: string
	constituency: string
}

export interface UKMPLookupResult {
	success: true
	mp: MP
}

export interface UKMPLookupError {
	success: false
	error: string
}

export type UKMPLookupResponse = UKMPLookupResult | UKMPLookupError

// Parse constituency → MP lookup table
interface RawMPRecord {
	Email: string
	'Full name or Title': string
	Salutation: string
	Constituency: string
}

const mpRecords: RawMPRecord[] = parse(mpData, {
	columns: true,
	skip_empty_lines: true
})

const constituencyToMP: Record<string, RawMPRecord> = {}
mpRecords.forEach((record: RawMPRecord): void => {
	if (record.Constituency) {
		constituencyToMP[record.Constituency] = record
	}
})

// Build set of all valid MP emails for whitelisting
const validMPEmails = new Set<string>()
for (const constituency in constituencyToMP) {
	const mp = constituencyToMP[constituency]
	if (mp.Email) {
		validMPEmails.add(mp.Email)
	}
}

export { validMPEmails }

export async function ukLookupMPByPostcode(postcode: string): Promise<UKMPLookupResponse> {
	const trimmedPostcode = postcode.trim()

	if (!trimmedPostcode) {
		return { success: false, error: 'Postcode is required' }
	}

	try {
		// Use official UK postcode API
		const response = await fetch(
			`https://api.postcodes.io/postcodes/${encodeURIComponent(trimmedPostcode)}`
		)

		if (!response.ok) {
			if (response.status === 404) {
				return { success: false, error: 'Postcode not found' }
			}
			throw new Error(`Postcode API error: ${response.status}`)
		}

		const data = await response.json()

		if (!data.result || !data.result.parliamentary_constituency) {
			return { success: false, error: 'No parliamentary constituency found for this postcode' }
		}

		const constituency = data.result.parliamentary_constituency

		// Look up MP from our constituency data
		const mpRecord = constituencyToMP[constituency]
		if (!mpRecord) {
			return {
				success: false,
				error: `No MP found for constituency: ${constituency}`
			}
		}

		const mp: MP = {
			email: mpRecord.Email,
			name: mpRecord['Full name or Title'],
			salutation: mpRecord.Salutation,
			constituency: constituency
		}

		return { success: true, mp }
	} catch (error) {
		console.error('Postcode lookup error:', error)
		return {
			success: false,
			error: 'Failed to lookup postcode. Check your connection.'
		}
	}
}
