import { parse } from 'csv-parse/sync'
import postcodeData from '../../../data/postcode-to-constituency.csv?raw'
import mpData from '../../../data/uk-mps.csv?raw'

export interface MP {
	email: string
	name: string
	salutation: string
	constituency: string
}

export interface MPLookupResult {
	success: true
	mp: MP
}

export interface MPLookupError {
	success: false
	error: string
}

export type MPLookupResponse = MPLookupResult | MPLookupError

// Build postcode → constituency map. Postcode keys are already normalised in the CSV
const postcodeToConstituency = new Map<string, string>()
postcodeData
	.trim()
	.split('\n')
	.forEach((line) => {
		if (!line) return
		const [normalisedPostcode, constituency] = line.split(',')
		postcodeToConstituency.set(normalisedPostcode, constituency)
	})

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

export function lookupMPByPostcode(postcode: string): MPLookupResponse {
	const normalisedPostcode = postcode.trim().replace(/\s+/g, '').toUpperCase()

	if (!normalisedPostcode) {
		return { success: false, error: 'Postcode is required' }
	}

	const constituency = postcodeToConstituency.get(normalisedPostcode)
	if (!constituency) {
		return { success: false, error: 'Postcode not found in our database' }
	}

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
}
