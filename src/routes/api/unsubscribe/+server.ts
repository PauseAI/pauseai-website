export const prerender = false

import { AIRTABLE_WRITE_API_KEY, MAILERSEND_API_KEY } from '$env/static/private'
import { verificationParameter } from '$lib/config.js'
import Airtable from 'airtable'
import { StatusCodes } from 'http-status-codes'
import type { RequestHandler } from './$types'

const MEMBERS_BASE_ID = 'appWPTGqZmUcs3NWu'
const MEMBERS_TABLE_ID = 'tblL1icZBhTV1gQ9o'
const KEY_FIELD_NAME = 'Airtable ID'
const SUBSCRIBED_FIELD_NAME = 'Email subscription'
const EMAIL_FIELD_NAME = 'Email'

// Suppressing on both domains covers the recipient regardless of which
// sender (pauseai.info or pauseai.uk) actually sent them the email.
const MAILERSEND_DOMAIN_IDS = [
	'r83ql3p2qkzgzw1j', // pauseai.info
	'q3enl6xxy17l2vwr' // pauseai.uk
]

export const GET: RequestHandler = async ({ url }) => {
	const key = url.searchParams.get(verificationParameter)
	if (!key) {
		return new Response(`Parameter "${verificationParameter}" is required`, {
			status: StatusCodes.BAD_REQUEST
		})
	}
	if (!/^[a-zA-Z0-9]+$/.test(key)) {
		return new Response(`Parameter "${verificationParameter}" must be alphanumeric`, {
			status: StatusCodes.BAD_REQUEST
		})
	}

	const table = new Airtable({ apiKey: AIRTABLE_WRITE_API_KEY })
		.base(MEMBERS_BASE_ID)
		.table(MEMBERS_TABLE_ID)

	const records = await table
		.select({
			filterByFormula: `{${KEY_FIELD_NAME}} = "${key}"`
		})
		.firstPage()
	if (!records.length) return new Response('Record not found', { status: StatusCodes.NOT_FOUND })

	const record = records[0]
	await record.patchUpdate(Object.fromEntries([[SUBSCRIBED_FIELD_NAME, false]]))

	const email = record.get(EMAIL_FIELD_NAME)
	if (email) {
		await Promise.all(
			MAILERSEND_DOMAIN_IDS.map((domain_id) =>
				fetch('https://api.mailersend.com/v1/suppressions/unsubscribes', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${MAILERSEND_API_KEY}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ domain_id, recipients: [email] })
				})
			)
		)
	}

	return new Response('OK', { status: StatusCodes.OK })
}
