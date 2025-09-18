/* https://sveltejs.github.io/eslint-plugin-svelte/user-guide/ */
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import ts from 'typescript-eslint'
import svelteConfig from './svelte.config.js'

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		// See more details at: https://typescript-eslint.io/packages/parser/
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'], // Add support for additional file extensions, such as .svelte
				parser: ts.parser,
				// Specify a parser for each language, if needed:
				// parser: {
				//   ts: ts.parser,
				//   js: espree,    // Use espree for .js files (add: import espree from 'espree')
				//   typescript: ts.parser
				// },

				// We recommend importing and specifying svelte.config.js.
				// By doing so, some rules in eslint-plugin-svelte will automatically read the configuration and adjust their behavior accordingly.
				// While certain Svelte settings may be statically loaded from svelte.config.js even if you don’t specify it,
				// explicitly specifying it ensures better compatibility and functionality.
				svelteConfig
			}
		}
	},
	{
		rules: {
			// Override or add rule settings here, such as:
			// 'svelte/rule-name': 'error'

			// disabled
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/require-each-key': 'off',

			// configured
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_'
				}
			],

			// enabled
			'svelte/no-restricted-html-elements': [
				'warn',
				{
					elements: ['a'],
					message: 'Use $lib/components/custom/a.svelte instead'
				}
			]
		}
	},
	globalIgnores([
		'.netlify/',
		'.svelte-kit/',
		'build/',
		'static/',
		// TODO remove when done
		'src/routes/api/write',
		'src/routes/write'
	])
)
