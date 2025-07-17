import { AIRTABLE_API_KEY } from '$env/static/private'
import { validMPEmails } from './postcode-to-mp'

const MP_CONTACT_BASE_ID = 'appBInVvIm6opJ1Ob'
const UK_PARLIAMENTARIANS_TABLE_ID = 'tblH3ks9wqQHLpYx3'

export interface MPContactStatus {
	responded: boolean
}

/**
 * Check if an MP has been contacted and their response status
 * Uses filterByFormula to search by primary field (email)
 */
export async function checkMPContactHistory(mpEmail: string): Promise<MPContactStatus> {
	// Default response for when lookup fails or no API key
	const defaultResponse: MPContactStatus = {
		responded: false
	}

	// Return default if no API key (dev environment)
	if (!AIRTABLE_API_KEY) {
		console.log('No Airtable API key found - returning default MP contact status')
		return defaultResponse
	}

	try {
		// Use filterByFormula to search for the MP by email
		// This is the recommended approach since Airtable API doesn't support direct primary field lookup
		// filterByFormula is a potential attack vector so this must only ever be used with trusted input.
		// We use whitelist validation - only allow MP emails from our CSV
		if (!validMPEmails.has(mpEmail)) {
			console.error(`Rejected email to unauthorized recipient: ${mpEmail}`)
			return defaultResponse
		}

		const formula = `{Email} = ${JSON.stringify(mpEmail)}`
		const url = `https://api.airtable.com/v0/${MP_CONTACT_BASE_ID}/${UK_PARLIAMENTARIANS_TABLE_ID}?filterByFormula=${encodeURIComponent(formula)}`

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${AIRTABLE_API_KEY}`,
				'Content-Type': 'application/json'
			}
		})

		if (!response.ok) {
			throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
		}

		const data = await response.json()

		if (!data.records || data.records.length === 0) {
			console.error(
				`MP not found in Airtable: ${mpEmail}. All MPs should be pre-populated in the table.`
			)
			return defaultResponse
		}

		const responded = Boolean(data.records[0].fields['Responded'])

		console.log(`MP lookup success: ${mpEmail} - responded: ${responded}`)

		return {
			responded: responded
		}
	} catch (error) {
		console.error('Failed to check MP contact history:', error)

		// Fail gracefully - don't block the user experience
		return defaultResponse
	}
}
