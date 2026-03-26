/**
 * Gets the appropriate environment object based on context - both Node.js and browser environments
 */
export function getEnvironment(): ImportMetaEnv | NodeJS.ProcessEnv {
	if (typeof import.meta !== 'undefined' && import.meta.env) {
		//	   	console.debug(`env from import.meta.env (browser context)`)
		return import.meta.env
	}

	// Node.js context
	if (typeof process !== 'undefined' && process.versions && process.versions.node) {
		//	   	console.debug(`env from process.env (Node.js context)`)
		return process.env
	}

	// Fallback (should never happen)
	console.error('no env found :-(')
	return {}
}

/**
 * Determines if the current environment is development or test
 * In practice, this means "not in CI" unless explicitly overridden by env.DEV
 */
export function isDev(): boolean {
	const env = getEnvironment()
	// Explicit DEV=true forces dev mode regardless of CI
	return env.DEV === true || env.DEV === 'true' || env.CI !== 'true'
}

/**
 * Returns a formatted string with complete environment context for logging
 * Shows CI status and DEV override which determine isDev behavior
 */
export function getDevContext(): string {
	const env = getEnvironment()
	const icon = isDev() ? '✓' : '✗'

	// Build context string showing relevant factors
	const parts = [`CI: ${env.CI || 'false'}`]

	// Show DEV if it's set (since it can override CI)
	if (env.DEV === true || env.DEV === 'true') {
		parts.push(`DEV: ${env.DEV}`)
	}

	return `isDev: ${icon} (${parts.join(', ')})`
}

/**
 * Derive locale from branch name for l10n-xx branches (e.g. l10n-es → "es")
 */
function branchLocale(env: ImportMetaEnv | NodeJS.ProcessEnv): string | undefined {
	const branch = (env.BRANCH as string) || (env.HEAD as string) || ''
	const match = branch.match(/^l10n-([a-z]{2})$/)
	return match ? match[1] : undefined
}

/**
 * Process default settings plus env vars to determine which locales should be enabled
 */
export function possiblyOverriddenLocales(defaults: { locales: string[] }): string[] {
	const env = getEnvironment()
	const fromEnv = env.PARAGLIDE_LOCALES as string | undefined
	const fromBranch = branchLocale(env)
	const fallback = isDev() ? 'en' : 'all'
	const envValue = (fromEnv || fromBranch || fallback).trim()
	const source = fromEnv
		? `PARAGLIDE_LOCALES="${fromEnv}"`
		: fromBranch
			? `branch "${(env.BRANCH as string) || env.HEAD}"`
			: `default (${fallback})`
	const listedLocales = envValue.replace(/all|-/g, ',')
	const inclusive = listedLocales === envValue
	const namedLocales = listedLocales.split(',').map((locale: string) => locale.trim())
	const result = defaults.locales.filter((locale: string) =>
		inclusive ? namedLocales.includes(locale) : !namedLocales.includes(locale)
	)
	if (!result.includes('en')) result.push('en')
	if (inclusive) {
		const unknown = namedLocales.filter((l: string) => l !== 'all' && !defaults.locales.includes(l))
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
