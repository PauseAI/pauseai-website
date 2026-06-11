export const prerender = false

import { json } from '@sveltejs/kit'
import { isOnboardingLive } from '$lib/server/onboarding'
import type { RequestHandler } from './$types'

export type OnboardingModeApiResponse = { live: boolean }

// Lets the (prerendered) pages embedding the onboarding form discover at
// runtime whether submissions are live or stubbed, so the form can log its
// mode in the browser console on load.
export const GET: RequestHandler = () => {
	const body: OnboardingModeApiResponse = { live: isOnboardingLive() }
	return json(body, { headers: { 'cache-control': 'no-store' } })
}
