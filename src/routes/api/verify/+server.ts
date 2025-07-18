export const prerender = false

import Airtable from 'airtable'
import { AIRTABLE_WRITE_API_KEY } from '$env/static/private'
import { verificationParameter } from '$lib/config.js'

const TABLE_PARAMETER = 'table'
const DEFAULT_TABLE = 'join'

const VERIFICATION_TABLES = new Map([
	[
		'join',
		{
			baseId: 'appWPTGqZmUcs3NWu',
			tableId: 'tblL1icZBhTV1gQ9o',
			keyFieldName: 'Airtable ID',
			verifiedFieldName: 'Verified email'
		}
	],
	[
		'statement',
		{
			baseId: 'appWPTGqZmUcs3NWu',
			tableId: 'tbl2emfOWNWoVz1kW',
			keyFieldName: 'airtable_id',
			verifiedFieldName: 'email_verified'
		}
	]
])

export async function GET({ url }) {
	const key = url.searchParams.get(verificationParameter)
	if (!key) {
		return new Response(`Parameter "${verificationParameter}" is required`, { status: 400 })
	}
	if (!/^[a-zA-Z0-9]+$/.test(key)) {
		return new Response(`Parameter "${verificationParameter}" must be alphanumeric`, {
			status: 400
		})
	}

	const tableName = url.searchParams.get(TABLE_PARAMETER) || DEFAULT_TABLE
	const tableConfig = VERIFICATION_TABLES.get(tableName)

	if (!tableConfig) {
		return new Response(`Invalid table name "${tableName}"`, { status: 400 })
	}

	const table = new Airtable({ apiKey: AIRTABLE_WRITE_API_KEY })
		.base(tableConfig.baseId)
		.table(tableConfig.tableId)

	const records = await table
		.select({
			filterByFormula: `{${tableConfig.keyFieldName}} = "${key}"`
		})
		.firstPage()
	if (!records.length) return new Response('Record not found', { status: 404 })
	await records[0].patchUpdate(Object.fromEntries([[tableConfig.verifiedFieldName, true]]))
	return new Response('OK', { status: 200 })
}
