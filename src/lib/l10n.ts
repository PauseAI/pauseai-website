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
const SETTINGS_PATH = path.resolve('./project.inlang/settings.json')

/**
 * Get the complete default settings object
 * @returns The full default settings object with all properties
 */
export function getDefaultSettings(): typeof defaultSettingsConfig {
	return defaultSettingsConfig
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
	[key: string]: unknown
}): void {
	fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}
