/**
 * Default Paraglide settings configuration
 * This file is the source of truth for default locale settings
 * and is used by both build scripts and browser code.
 */

export default {
	$schema: 'https://inlang.com/schema/project-settings',
	baseLocale: 'en',
	locales: ['en', 'es'],
	modules: [
		'https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@latest/dist/index.js',
		'https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@latest/dist/index.js'
	],
	'plugin.inlang.messageFormat': {
		pathPattern: './l10n-cage/json/{locale}.json'
	},
	// This is accessed from inlang-settings.ts despite the plugin not existing anymore
	'plugin.paraglide-js-adapter': {
		routing: {
			strategy: 'prefix',
			defaultLocale: 'en'
		}
	}
}
