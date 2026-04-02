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

function readEnvString(env: ImportMetaEnv | NodeJS.ProcessEnv, key: string): string | undefined {
	const value = (env as Record<string, unknown>)[key]
	if (typeof value === 'string') return value
	if (typeof value === 'boolean') return value ? 'true' : 'false'
	return undefined
}

function isTrueString(value: string | undefined): boolean {
	return value === 'true'
}

/**
 * Determines if the current environment is development or test
 * In practice, this means "not in CI" unless explicitly overridden by env.DEV
 */
export function isDev(): boolean {
	const env = getEnvironment()
	const dev = readEnvString(env, 'DEV')
	const ci = readEnvString(env, 'CI')
	// Explicit DEV=true forces dev mode regardless of CI
	return isTrueString(dev) || ci !== 'true'
}

/**
 * Returns a formatted string with complete environment context for logging
 * Shows CI status and DEV override which determine isDev behavior
 */
export function getDevContext(): string {
	const env = getEnvironment()
	const icon = isDev() ? 'yes' : 'no'
	const ci = readEnvString(env, 'CI')
	const dev = readEnvString(env, 'DEV')

	// Build context string showing relevant factors
	const parts = [`CI: ${ci ?? 'false'}`]

	// Show DEV if it's set (since it can override CI)
	if (isTrueString(dev)) {
		parts.push(`DEV: ${dev}`)
	}

	return `isDev: ${icon} (${parts.join(', ')})`
}

/**
 * Process default settings plus env vars to determine which locales should be enabled
 */
export function possiblyOverriddenLocales(defaults: { locales: string[] }): string[] {
	const env = getEnvironment()
	const localesEnv = readEnvString(env, 'PARAGLIDE_LOCALES')
	const envValue = (localesEnv ?? (isDev() ? 'en' : 'all')).trim()
	const listedLocales = envValue.replace(/all|-/g, ',')
	const inclusive = listedLocales === envValue
	const namedLocales = listedLocales.split(',').map((locale) => locale.trim())
	const result = defaults.locales.filter((locale) =>
		inclusive ? namedLocales.includes(locale) : !namedLocales.includes(locale)
	)
	if (!result.includes('en')) result.push('en')
	//	console.debug(`defaults: ${JSON.stringify(defaults)}`)
	//	console.log(`PARAGLIDE_LOCALES: ${localesEnv} (${getDevContext()}) => envValue: ${envValue} => result: ${result}`)
	return result
}
