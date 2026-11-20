// Members verification links whose key is an Airtable record id, checked by CiviCRM's
// PauseaiMemberIntake.verify with the website API account's key (crmIntake.ts). The contract is
// pauseai-civicrm's docs/intake-endpoint-plan.md, "Signup keys", `verify`.
import { env } from '$env/dynamic/private'
import { reportCrmProblem, verifyLinkInCrm, type CrmVerifyResult } from '$lib/server/crmIntake'

export type MemberLinkBackend = 'airtable' | 'civicrm'

/** Where /verify sends a Members link with a record-id key. Anything but "civicrm" is Airtable. */
export const memberLinkBackend = (): MemberLinkBackend =>
	env.MEMBER_LINK_BACKEND === 'civicrm' ? 'civicrm' : 'airtable'

/** `key` is the link's verificationKey as it arrived, without `rec`. Never rejects. */
export const verifyMemberLinkInCrm = (key: string, token: string): Promise<CrmVerifyResult> =>
	verifyLinkInCrm('PauseaiMemberIntake/verify', key, token, (details) =>
		reportCrmProblem(
			'CRM member link verify error',
			{ check: 'crm-member-link', action: 'verify', recordId: `rec${key}`, ...details },
			{ fingerprint: ['crm-member-link', 'verify', 'error'], level: 'error' }
		)
	)
