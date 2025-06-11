/**
 * Localization paths configuration
 * These paths are used throughout the build and development process
 */
import fs from 'fs'
import path from 'path'
// Import default settings from our JavaScript module
import defaultSettingsConfig from '../../project.inlang/default-settings.js'

export const L10N_CAGE_DIR = './l10n-cage'
export const MARKDOWN_L10NS = `${L10N_CAGE_DIR}/md`
export const MESSAGE_L10NS = `${L10N_CAGE_DIR}/json`
export const MESSAGE_SOURCE = './messages/en.json'
export const MARKDOWN_SOURCE = './src/posts'

// Paraglide settings paths
export const SETTINGS_PATH = path.resolve('./project.inlang/settings.json')
export const DEFAULT_SETTINGS_PATH = path.resolve('./project.inlang/settings.default.json')

/**
 * Get the complete default settings object
 * @returns The full default settings object with all properties
 */
export function getDefaultSettings(): typeof defaultSettingsConfig {
	return defaultSettingsConfig
}

// For l10n scripts that need to know target languages
export function getTargetLocales(): string[] {
	return getDefaultSettings().locales.filter((tag) => tag !== 'en')
}

/**
 * Process the PARAGLIDE_LOCALES environment variable and return filtered locales
 * based on the logic from prepare-paraglide-settings.ts
 *
 * This is an isomorphic function that works in both Node.js and browser environments.
 *
 * @param options.defaultSettings - The default settings object (optional, will use imported defaults if not provided)
 * @param options.localesEnvValue - The value of PARAGLIDE_LOCALES (optional, will use process.env if not provided)
 * @returns An array of locale strings to use
 */
export function processParaglideLocales(options?: {
	defaultSettings?: { locales: string[]; baseLocale: string }
	localesEnvValue?: string | null
}): string[] {
	// Get default settings - use provided settings or import
	const defaultSettings = options?.defaultSettings || getDefaultSettings()

	// Create settings with potentially filtered locales
	let locales = [...defaultSettings.locales]

	// Get env value - use provided value or process.env
	const localesEnvValue =
		options?.localesEnvValue !== undefined
			? options.localesEnvValue
			: typeof process !== 'undefined'
				? process.env.PARAGLIDE_LOCALES
				: null

	// Check if PARAGLIDE_LOCALES is set
	if (localesEnvValue) {
		// Special case: "all" means use all locales from default settings
		if (localesEnvValue.trim() === 'all') {
			// Return all locales (already set as default)
			return locales
		} else {
			const requestedLocales = localesEnvValue.split(',').map((locale) => locale.trim())

			// Validate locales
			const validLocales = requestedLocales.filter((locale) =>
				defaultSettings.locales.includes(locale)
			)

			if (validLocales.length === 0) {
				console.warn('Warning: None of the requested locales are valid. Using all locales.')
				return locales
			} else {
				// Ensure base locale is included
				if (!validLocales.includes(defaultSettings.baseLocale)) {
					validLocales.push(defaultSettings.baseLocale)
				}

				// Return filtered locales
				return validLocales
			}
		}
	}

	return locales
}

/**
 * Write settings to the settings.json file
 * This preserves the full Inlang project settings format
 * while allowing locale overrides.
 */
export function writeSettingsFile(settings: {
	locales: string[]
	baseLocale: string
	$schema: string
	modules: string[]
	'plugin.inlang.messageFormat': {
		pathPattern: string
	}
	[key: string]: any
}): void {
	fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

/**
 * Resolves a path for Node.js environments, leaving it unchanged for browser environments.
 * Useful for isomorphic code that needs to work with file paths.
 *
 * @param filePath The file path to resolve
 * @returns The resolved path (absolute in Node.js, unchanged in browser)
 */
export function resolvePathIfNode(filePath: string): string {
	// Check if running in Node.js environment
	if (typeof process !== 'undefined' && process.versions && process.versions.node) {
		return path.resolve(filePath)
	}
	// In browser context, return the path unchanged
	return filePath
}
