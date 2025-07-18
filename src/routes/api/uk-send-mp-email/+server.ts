import { json } from '@sveltejs/kit'
import { AIRTABLE_API_KEY, AIRTABLE_WRITE_API_KEY } from '$env/static/private'
import { validMPEmails } from '$lib/server/uk-postcode-to-mp.js'

const MP_CONTACT_BASE_ID = 'appBInVvIm6opJ1Ob'
const EMAIL_TABLE_ID = 'tblkzjrRHiZiqMDGR'

// Rate limiting: 50 new emails per minute per server instance
const RATE_LIMIT_REQUESTS = 50
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const requestTimestamps: number[] = []

function isRateLimited(): boolean {
	const now = Date.now()
	const windowStart = now - RATE_LIMIT_WINDOW_MS

	// Remove old timestamps outside the window
	while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
		requestTimestamps.shift()
	}

	// Check if we're at the limit
	if (requestTimestamps.length >= RATE_LIMIT_REQUESTS) {
		return true
	}

	// Add current timestamp
	requestTimestamps.push(now)
	return false
}

interface EmailRequest {
	senderEmail: string
	senderName: string
	senderPostcode: string
	recipient: string
	subject: string
	message: string
}

export const POST = async ({ request }) => {
	if (!AIRTABLE_API_KEY || !AIRTABLE_WRITE_API_KEY) {
		return json({ error: 'server_error', message: 'Email service not configured' }, { status: 500 })
	}

	// Check rate limit
	if (isRateLimited()) {
		return json(
			{ error: 'rate_limit', message: 'Too many requests. Please try again later.' },
			{
				status: 429,
				headers: {
					'Retry-After': '60' // Suggest retry after 60 seconds
				}
			}
		)
	}

	try {
		const data: EmailRequest = await request.json()

		// Basic validation
		if (
			!data.senderEmail ||
			!data.senderName ||
			!data.senderPostcode ||
			!data.recipient ||
			!data.subject ||
			!data.message
		) {
			return json({ error: 'validation', message: 'All fields are required' }, { status: 400 })
		}

		// filterByFormula is a potential attack vector so this must only ever be used with trusted input.
		// We use whitelist validation - only allow MP emails from our CSV
		if (!validMPEmails.has(data.recipient)) {
			console.warn(`Rejected email to unauthorized recipient: ${data.recipient}`)
			return json({ error: 'validation', message: 'Invalid recipient email' }, { status: 400 })
		}

		// First, find the MP record ID by email
		const mpFormula = `{Email} = ${JSON.stringify(data.recipient)}`
		const mpLookupUrl = `https://api.airtable.com/v0/${MP_CONTACT_BASE_ID}/tblH3ks9wqQHLpYx3?filterByFormula=${encodeURIComponent(mpFormula)}`

		const mpResponse = await fetch(mpLookupUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${AIRTABLE_API_KEY}`,
				'Content-Type': 'application/json'
			}
		})

		if (!mpResponse.ok) {
			const errorText = await mpResponse.text()
			console.error('MP lookup error:', mpResponse.status, mpResponse.statusText, errorText)
			return json({ error: 'server_error', message: 'Failed to find MP record' }, { status: 500 })
		}

		const mpData = await mpResponse.json()
		if (!mpData.records || mpData.records.length === 0) {
			console.error(`MP record not found for email: ${data.recipient}`)
			return json({ error: 'server_error', message: 'MP record not found' }, { status: 500 })
		}

		const mpRecordId = mpData.records[0].id

		// Create record in Airtable with linked MP record
		const airtableData = {
			fields: {
				'Sender email': data.senderEmail,
				'Sender name': data.senderName,
				'Sender postcode': data.senderPostcode,
				Recipient: [mpRecordId], // Array of record IDs for linked field
				Subject: data.subject,
				Message: data.message
			}
		}

		const response = await fetch(
			`https://api.airtable.com/v0/${MP_CONTACT_BASE_ID}/${EMAIL_TABLE_ID}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${AIRTABLE_WRITE_API_KEY}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(airtableData)
			}
		)

		if (!response.ok) {
			const errorText = await response.text()
			console.error('Airtable API error:', response.status, response.statusText, errorText)
			return json({ error: 'server_error', message: 'Failed to send email' }, { status: 500 })
		}

		const result = await response.json()
		console.log(`Email record created for ${data.senderEmail} -> ${data.recipient}`)

		return json({ success: true, recordId: result.id })
	} catch (error) {
		console.error('Error sending MP email:', error)
		return json({ error: 'server_error', message: 'Failed to send email' }, { status: 500 })
	}
}
