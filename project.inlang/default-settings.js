/**
 * Default Paraglide settings configuration
 * This file is the source of truth for default locale settings
 * and is used by both build scripts and browser code.
 */

export default {
	$schema: 'https://inlang.com/schema/project-settings',
	baseLocale: 'en',
	locales: ['en', 'de', 'nl'],
	modules: [
		'https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@latest/dist/index.js',
		'https://cdn.jsdelivr.net/npm/@inlang/plugin-paraglide-js-adapter@latest/dist/index.js'
	],
	'plugin.inlang.messageFormat': {
		pathPattern: './src/temp/translations/json/{locale}.json'
	},
	'plugin.paraglide-js-adapter': {
		routing: {
			strategy: 'prefix-all-locales',
			defaultLocale: 'en'
		}
	}
}
