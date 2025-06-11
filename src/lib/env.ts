/**
 * Gets the appropriate environment object based on context - both Node.js and browser environments
 */
export function getEnvironment(): Record<string, any> {
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
 * Process default settings plus env vars to determine which locales should be enabled
 */
export function possiblyOverriddenLocales(defaults: { locales: string[] }): string[] {
	const env = getEnvironment()
	const envValue = (env.PARAGLIDE_LOCALES || (isDev() ? 'en' : 'all')).trim()
	const listedLocales = envValue.replace(/all|-/g, ',')
	const inclusive = listedLocales === envValue
	const namedLocales = listedLocales.split(',').map((locale: string) => locale.trim())
	let result = defaults.locales.filter((locale: string) =>
		inclusive ? namedLocales.includes(locale) : !namedLocales.includes(locale)
	)
	if (!result.includes('en')) result.push('en')
	//	console.debug(`defaults: ${JSON.stringify(defaults)}`)
	//	console.log(`PARAGLIDE_LOCALES: ${env.PARAGLIDE_LOCALES} (${getDevContext()}) => envValue: ${envValue} => result: ${result}`)
	return result
}
