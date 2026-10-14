// A signed, expiring token that proves the browser posting a `record_id` was
// handed that id by the submit action. docs/join-form-flow.md,
// "Continuation token", describes the rollout switch.

import { env } from '$env/dynamic/private'
import { SIGNUP_MAX_AGE_MS } from '$lib/components/onboarding/signupMaxAge'
import { isContinuationEnforced } from '$lib/server/onboarding'
import { reportError } from '$lib/server/sentry'
import { checkToken, signToken, type TokenVerdict } from '$lib/server/signedToken'

// An hour beyond the browser's copy: the token is minted, and its expiry floored
// to the second, before the browser stamps that copy.
export const TOKEN_TTL_SECONDS = SIGNUP_MAX_AGE_MS / 1000 + 60 * 60

const prefix = (recordId: string) => `onboarding-continuation:v1:${recordId}`

export function mintToken(secret: string, recordId: string, now: number): Promise<string> {
	return signToken(secret, prefix(recordId), Math.floor(now / 1000) + TOKEN_TTL_SECONDS)
}

export function verifyToken(
	secret: string,
	recordId: string,
	token: string,
	now: number
): Promise<TokenVerdict> {
	return checkToken(secret, prefix(recordId), token, now)
}

let reportedNoSecret = false

function getSecret(): string | undefined {
	const secret = env.ONBOARDING_CONTINUATION_SECRET
	if (secret) return secret
	if (!reportedNoSecret) {
		reportedNoSecret = true
		const ignored = isContinuationEnforced()
			? ' ONBOARDING_CONTINUATION_ENFORCE=true is ignored until it is set.'
			: ''
		console.error(
			`[onboarding] ONBOARDING_CONTINUATION_SECRET is not set: no continuation tokens are issued or checked, so any record id can be updated.${ignored}`
		)
	}
	return undefined
}

// Undefined without a secret, so the form still works; the update check then
// lets everything through.
export async function issueContinuationToken(
	recordId: string,
	now = Date.now()
): Promise<string | undefined> {
	const secret = getSecret()
	return secret ? mintToken(secret, recordId, now) : undefined
}

// What an update to `recordId` may do: 'proven' when its token is valid,
// 'allowed' when it goes ahead without one, 'refused' otherwise. Until
// ONBOARDING_CONTINUATION_ENFORCE is "true" a bad token is only reported, because a
// session that started before tokens existed holds an id without one for as long
// as the browser keeps it. Only a 'proven' update may be handed a fresh token,
// so a token is only ever issued at a create or in exchange for a valid one.
export async function checkContinuation(
	recordId: string,
	token: string,
	now = Date.now()
): Promise<'proven' | 'allowed' | 'refused'> {
	const secret = getSecret()
	if (!secret) return 'allowed'
	const verdict = await verifyToken(secret, recordId, token, now)
	if (verdict === 'valid') return 'proven'
	const enforced = isContinuationEnforced()
	// Never the token or the secret: either would let the reader forge or replay.
	const context = { check: 'onboarding-continuation', verdict, enforced, recordId }
	console.warn('[onboarding] update without a valid continuation token', context)
	await reportError(new Error(`Onboarding continuation token ${verdict}`), context)
	return enforced ? 'refused' : 'allowed'
}
