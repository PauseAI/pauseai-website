export const prerender = false

import Airtable from 'airtable'
import { AIRTABLE_API_KEY } from '$env/static/private'
import { verificationParameter } from '$lib/config.js'

const KEY_FIELD_NAME = 'Verification key'
const VERIFIED_FIELD_NAME = 'Verified'
const TABLE_PARAMETER = 'table'
const DEFAULT_TABLE = 'join'

const VERIFICATION_TABLES = new Map([
	['join', { baseId: 'appJI3O6GrPx1zrzY', tableId: 'tblEMavUHON6r3rpL' }],
	['statement', { baseId: 'appJI3O6GrPx1zrzY', tableId: 'tblEMavUHON6r3rpL' }]
])

export async function GET({ url }) {
	const key = url.searchParams.get(verificationParameter)
	if (!key) {
		return new Response(`Parameter "${verificationParameter}" is required`, { status: 400 })
	}

	const tableName = url.searchParams.get(TABLE_PARAMETER) || DEFAULT_TABLE
	const tableConfig = VERIFICATION_TABLES.get(tableName)

	if (!tableConfig) {
		return new Response(`Invalid table name "${tableName}"`, { status: 400 })
	}

	const table = new Airtable({ apiKey: AIRTABLE_API_KEY })
		.base(tableConfig.baseId)
		.table(tableConfig.tableId)

	const records = await table
		.select({
			filterByFormula: `{${KEY_FIELD_NAME}} = "${key}"`
		})
		.firstPage()
	await records[0]?.patchUpdate(Object.fromEntries([[VERIFIED_FIELD_NAME, true]]))

	return new Response(null, { status: 301, headers: { Location: '/' } })
}
