import { json } from '@sveltejs/kit'
import { ukLookupMPByPostcode } from '$lib/server/uk-postcode-to-mp.js'
import { ukCheckMPContactHistory } from '$lib/server/uk-mp-contact-status.js'

export const POST = async ({ request }) => {
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
		const result = await ukLookupMPByPostcode(postcode)

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
		const contactStatus = await ukCheckMPContactHistory(result.mp.email)

		// Return MP data with contact status
		return json(
			{
				success: true,
				mp: result.mp,
				contactStatus
			},
			{
				headers: {
					'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
				}
			}
		)
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
