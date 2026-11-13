export const prerender = false

import { AIRTABLE_WRITE_API_KEY } from '$env/static/private'
import { airtableFormulaString } from '$lib/airtable'
import {
	verificationConfirmedParameter,
	verificationNeedsClick,
	verificationParameter
} from '$lib/config.js'
import {
	getVerificationSecret,
	normaliseEmail,
	verifyVerificationToken
} from '$lib/server/emailVerification'
import { MEMBERS_BASE_ID, MEMBERS_TABLE_ID, STATEMENT_TABLE_ID } from '$lib/server/members'
import { memberRowToVerify } from '$lib/server/mergedMemberRow'
import { reportError } from '$lib/server/sentry'
import { statementBackend, verifyStatementInCrm } from '$lib/server/statementCrm'
import { isSignupKey, verifySignupInCrm } from '$lib/server/memberCrm'
import type { CrmVerifyResult } from '$lib/server/crmIntake'
import { json } from '@sveltejs/kit'
import Airtable from 'airtable'
import { StatusCodes } from 'http-status-codes'
import type { RequestHandler } from './$types'

const TABLE_PARAMETER = 'table'
const TOKEN_PARAMETER = 'token'
const DEFAULT_TABLE = 'join'

const VERIFICATION_TABLES = new Map([
	[
		'join',
		{
			baseId: MEMBERS_BASE_ID,
			tableId: MEMBERS_TABLE_ID,
			keyFieldName: 'Airtable ID',
			verifiedFieldName: 'Verified email',
			isMembers: true
		}
	],
	[
		'statement',
		{
			baseId: MEMBERS_BASE_ID,
			tableId: STATEMENT_TABLE_ID,
			keyFieldName: 'airtable_id',
			verifiedFieldName: 'email_verified',
			isMembers: false
		}
	]
])

// /verify answers this with an explanation of how to get a new link, not an error.
const linkExpired = () => json({ outcome: 'expired' }, { status: StatusCodes.GONE })

// The key in the statement links CiviCRM mails: its signature's activity id.
const CRM_STATEMENT_KEY = /^s\d+$/

/**
 * A link CiviCRM mailed goes to CiviCRM whichever backend is set, so it keeps working after
 * a rollback to Airtable. With the CiviCRM backend every statement link goes there, old
 * Airtable ones included: CiviCRM holds the imported rows and judges those links itself.
 */
const verifiesInCrm = (key: string, token: string) =>
	(CRM_STATEMENT_KEY.test(key) && token !== '') || statementBackend() === 'civicrm'

async function verifyInCrm(
	verify: (key: string, token: string) => Promise<CrmVerifyResult>,
	key: string,
	token: string
): Promise<Response> {
	switch (await verify(key, token)) {
		case 'ok':
			return new Response('OK', { status: StatusCodes.OK })
		case 'expired':
			return linkExpired()
		case 'invalid':
			return new Response('This verification link is not valid', {
				status: StatusCodes.NOT_FOUND
			})
		case 'failed':
			return new Response('Verification is unavailable right now. Please try again later.', {
				status: StatusCodes.BAD_GATEWAY
			})
	}
}

const rowEmail = (fields: Record<string, unknown>) =>
	typeof fields.Email === 'string' ? fields.Email : ''

// The link's parameters arrive form-encoded in the body, never in this URL, so a live
// link stays out of request logs and error reports.
export const POST: RequestHandler = async ({ request }) => {
	const params = new URLSearchParams(await request.text())
	const key = params.get(verificationParameter)
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

	const tableName = params.get(TABLE_PARAMETER) || DEFAULT_TABLE
	const tableConfig = VERIFICATION_TABLES.get(tableName)

	if (!tableConfig) {
		return new Response(`Invalid table name "${tableName}"`, { status: StatusCodes.BAD_REQUEST })
	}

	// Refusing here means only the click on /verify can take effect, not a stale copy of the
	// page that posts on load.
	if (verificationNeedsClick(params) && params.get(verificationConfirmedParameter) !== 'true') {
		return new Response(`Parameter "${verificationConfirmedParameter}" is required`, {
			status: StatusCodes.BAD_REQUEST
		})
	}

	const token = params.get(TOKEN_PARAMETER) ?? ''
	// Set only for a Members link, which must carry a token this secret can check.
	let memberSecret: string | undefined
	if (tableConfig.isMembers && isSignupKey(key)) {
		// A signup key's contact lives in CiviCRM alone, which judges the link against its address.
		if (!token) return linkExpired()
		return verifyInCrm(verifySignupInCrm, key, token)
	} else if (tableConfig.isMembers) {
		memberSecret = getVerificationSecret()
		if (!token || !memberSecret) {
			console.warn('[verification] refused a link it cannot check', {
				recordId: `rec${key}`,
				hasToken: token !== ''
			})
			return linkExpired()
		}
	} else if (verifiesInCrm(key, token)) {
		return verifyInCrm(verifyStatementInCrm, key, token)
	}

	const table = new Airtable({ apiKey: AIRTABLE_WRITE_API_KEY })
		.base(tableConfig.baseId)
		.table(tableConfig.tableId)

	const records = await table
		.select({
			filterByFormula: `{${tableConfig.keyFieldName}} = ${airtableFormulaString(key)}`
		})
		.firstPage()
	if (!records.length) return new Response('Record not found', { status: StatusCodes.NOT_FOUND })
	const named = records[0]

	let recordId = named.id
	// For a Members link, the address its token was checked against.
	let signedEmail: string | undefined
	if (memberSecret) {
		// Against the row's address now: a link mailed to an address the row no longer
		// has must not verify the new one.
		const email = rowEmail(named.fields)
		const verdict = await verifyVerificationToken(memberSecret, named.id, email, token, Date.now())
		if (verdict !== 'valid') {
			console.warn('[verification] refused a signed link', { recordId: named.id, verdict })
			return linkExpired()
		}
		signedEmail = email

		try {
			const target = await memberRowToVerify(named, (id) => table.find(id))
			recordId = target.id
			if (target.dataError) {
				await reportError(new Error(`Email verification: ${target.dataError}`), {
					tableId: tableConfig.tableId,
					recordId: named.id
				})
			}
		} catch (error) {
			// The click still verifies the row it named when the surviving row cannot be read.
			console.error('Error following "Merged into":', error)
			await reportError(error, {
				tableId: tableConfig.tableId,
				recordId: named.id,
				operation: 'followMergedInto'
			})
		}
	}
	await table.update(recordId, Object.fromEntries([[tableConfig.verifiedFieldName, true]]))

	// Airtable has no conditional update, and the onboarding form can change a row's address
	// (clearing its verification) between the read above and this write. So the address is
	// re-checked after writing, and the tick undone if it is no longer the one the token signed.
	if (signedEmail !== undefined) {
		const written = await table.find(recordId)
		if (normaliseEmail(rowEmail(written.fields)) !== normaliseEmail(signedEmail)) {
			await table.update(recordId, Object.fromEntries([[tableConfig.verifiedFieldName, false]]))
			console.warn('[verification] address changed while verifying', { recordId })
			return linkExpired()
		}
	}
	return new Response('OK', { status: StatusCodes.OK })
}
