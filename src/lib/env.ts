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
 * Derive locale from branch name for l10n-xx branches (e.g. l10n-es → "es")
 */
function branchLocale(env: EnvContext): string | undefined {
	const branch = env.BRANCH || env.HEAD || ''
	const match = branch.match(/^l10n-([a-z]{2})$/)
	return match ? match[1] : undefined
}

/**
 * Process default settings plus env vars to determine which locales should be enabled.
 */
export function possiblyOverriddenLocales(
	env: EnvContext,
	defaults: { locales: string[] }
): string[] {
	const fromEnv = env.PARAGLIDE_LOCALES
	const fromBranch = branchLocale(env)
	const fallback = isDev(env) ? 'en' : 'all'
	const envValue = (fromEnv || fromBranch || fallback).trim()
	const source = fromEnv
		? `PARAGLIDE_LOCALES="${fromEnv}"`
		: fromBranch
			? `branch "${env.BRANCH || env.HEAD}"`
			: `default (${fallback})`
	const listedLocales = envValue.replace(/all|-/g, ',')
	const inclusive = listedLocales === envValue
	const namedLocales = listedLocales.split(',').map((locale) => locale.trim())
	const result = defaults.locales.filter((locale) =>
		inclusive ? namedLocales.includes(locale) : !namedLocales.includes(locale)
	)
	if (!result.includes('en')) result.push('en')
	if (inclusive) {
		const unknown = namedLocales.filter((l) => l !== 'all' && !defaults.locales.includes(l))
		if (unknown.length > 0) {
			console.error(
				`Error: ${source} requests "${unknown.join(', ')}" but default-settings.js only has [${defaults.locales.join(', ')}].`
			)
			console.error(
				`Add the locale(s) to default-settings.js or fix your .env / PARAGLIDE_LOCALES.`
			)
			process.exit(1)
		}
	}
	console.log(`Locale source: ${source} → [${result.join(', ')}]`)
	return result
}
