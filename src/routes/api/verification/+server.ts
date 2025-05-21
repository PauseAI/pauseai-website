export const prerender = false

import Airtable from 'airtable'
import { AIRTABLE_API_KEY } from '$env/static/private'
import { verificationParameter } from '$lib/config.js'

const BASE_ID = 'appJI3O6GrPx1zrzY'
const TABLE_ID = 'tblEMavUHON6r3rpL'
const KEY_FIELD_NAME = 'Verification key'
const VERIFIED_FIELD_NAME = 'Verified'

const TABLE = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID).table(TABLE_ID)

export async function GET({ url }) {
	const key = url.searchParams.get(verificationParameter)
	if (!key) {
		return new Response(`Parameter "${verificationParameter}" is required`, { status: 400 })
	}

	const records = await TABLE.select({
		filterByFormula: `{${KEY_FIELD_NAME}} = "${key}"`
	}).firstPage()
	await records[0]?.patchUpdate(Object.fromEntries([[VERIFIED_FIELD_NAME, true]]))

	return new Response(null, { status: 301, headers: { Location: '/' } })
}
