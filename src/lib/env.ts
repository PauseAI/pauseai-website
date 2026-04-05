/**
 * Universal environment variable context for both SvelteKit and standalone Node.js scripts.
 *
 * This file contains the logic for environment-based calculations but NOT the imports
 * from $env, making it safe to import in standard Node.js environments.
 */

export interface EnvContext {
	CI?: string
	DEV?: string
	PARAGLIDE_LOCALES?: string
	[key: string]: string | undefined
}

/**
 * Determines if the current environment is development or test.
 * In practice, this means "not in CI" unless explicitly overridden by env.DEV.
 */
export function isDev(env: EnvContext): boolean {
	// Explicit DEV=true forces dev mode regardless of CI
	return env.DEV === 'true' || env.CI !== 'true'
}

/**
 * Returns a formatted string with complete environment context for logging.
 * Shows CI status and DEV override which determine isDev behavior.
 */
export function getDevContext(env: EnvContext): string {
	const icon = isDev(env) ? 'yes' : 'no'

	// Build context string showing relevant factors
	const parts = [`CI: ${env.CI ?? 'false'}`]

	// Show DEV if it's set (since it can override CI)
	if (env.DEV === 'true') {
		parts.push(`DEV: ${env.DEV}`)
	}

	return `isDev: ${icon} (${parts.join(', ')})`
}

/**
 * Process default settings plus env vars to determine which locales should be enabled.
 */
export function possiblyOverriddenLocales(
	env: EnvContext,
	defaults: { locales: string[] }
): string[] {
	const envValue = (env.PARAGLIDE_LOCALES ?? (isDev(env) ? 'en' : 'all')).trim()
	const listedLocales = envValue.replace(/all|-/g, ',')
	const inclusive = listedLocales === envValue
	const namedLocales = listedLocales.split(',').map((locale) => locale.trim())
	const result = defaults.locales.filter((locale) =>
		inclusive ? namedLocales.includes(locale) : !namedLocales.includes(locale)
	)
	if (!result.includes('en')) result.push('en')
	return result
}
