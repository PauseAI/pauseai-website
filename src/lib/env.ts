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
 */
export function isDev(): boolean {
	const env = getEnvironment()
	const envMode = env.NODE_ENV || env.MODE
	// Note that an undefined environment defaults to dev - fits with the frameworks we use
	return !envMode || envMode === 'development' || envMode === 'test' || env.DEV === true
}

/**
 * Returns a formatted string with complete environment context for logging
 * Shows all factors that contribute to the isDev decision
 */
export function getDevContext(): string {
	const env = getEnvironment()
	const icon = isDev() ? '✓' : '✗'

	// Build context showing all relevant environment variables
	const parts = []

	// Always show NODE_ENV, even if undefined
	parts.push(`NODE_ENV=${env.NODE_ENV || 'undefined'}`)

	// Show MODE if it exists and differs from NODE_ENV
	if (env.MODE && (!env.NODE_ENV || env.MODE !== env.NODE_ENV)) {
		parts.push(`MODE=${env.MODE}`)
	}

	// Show DEV flag if it's true (since it can override everything else)
	if (env.DEV === true) {
		parts.push(`DEV=true`)
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
