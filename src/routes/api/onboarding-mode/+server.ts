export const prerender = false

import { json } from '@sveltejs/kit'
import { isOnboardingLive } from '$lib/server/onboarding'
import type { RequestHandler } from './$types'

export type OnboardingModeApiResponse = { live: boolean }

// Lets the (prerendered) pages embedding the onboarding form discover at
// runtime whether submissions are live or stubbed. The form logs its mode from
// this, and decides whether to require an anti-spam token — it assumes live if
// this doesn't answer, so a failure here costs a widget, not protection.
export const GET: RequestHandler = () => {
	const body: OnboardingModeApiResponse = { live: isOnboardingLive() }
	return json(body, { headers: { 'cache-control': 'no-store' } })
}
