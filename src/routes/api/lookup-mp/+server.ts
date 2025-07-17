import { json } from '@sveltejs/kit'
import { lookupMPByPostcode } from '$lib/server/postcode-to-mp.js'
import { checkMPContactHistory } from '$lib/server/mp-contact-status.js'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json()
		const { postcode } = body

		// Validate request body
		if (!postcode) {
			return json(
				{
					success: false,
					error: 'Postcode is required',
					type: 'validation'
				},
				{ status: 400 }
			)
		}

		// Lookup MP
		const result = lookupMPByPostcode(postcode)

		if (!result.success) {
			return json(
				{
					success: false,
					error: result.error,
					type: 'not_found'
				},
				{ status: 200 } // Use 200 for user-facing validation errors
			)
		}

		// Check MP contact history in Airtable
		const contactStatus = await checkMPContactHistory(result.mp.email)

		// Return MP data with contact status
		return json({
			success: true,
			mp: result.mp,
			contactStatus
		})
	} catch (err) {
		console.error('MP lookup error:', err)
		return json(
			{
				success: false,
				error: 'Internal server error. Please try again later.',
				type: 'server_error'
			},
			{ status: 500 }
		)
	}
}
