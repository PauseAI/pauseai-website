import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { possiblyOverriddenLocales } from '$lib/env'
import defaultSettings from '$lib/generated/paraglide-defaults'

export type LocaleEnvApiResponse = {
	envLocales: string[]
}

/**
 * Simplified API endpoint that returns the defaults + env-overridden locales
 * This helps detect mismatches between environment settings and compiled runtime
 */
export const GET: RequestHandler = async () => {
	const envLocales = possiblyOverriddenLocales(defaultSettings)
	return json({ envLocales } satisfies LocaleEnvApiResponse) // returns value under key 'envLocales'
}
