/* https://sveltejs.github.io/eslint-plugin-svelte/user-guide/ */
import js from '@eslint/js'
import markdown from '@eslint/markdown'
import prettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import ts from 'typescript-eslint'
import svelteConfig from './svelte.config.js'
import emptyMarkdownLinks from './eslint/plugin-empty-markdown-links.js'

export default defineConfig(
	js.configs.recommended,
	...ts.configs.recommended,
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
		files: ['**/*.md'],
		extends: [markdown.configs.recommended],
		plugins: {
			emptyMarkdownLinks
		},
		rules: {
			'markdown/fenced-code-language': 'off',
			'markdown/no-missing-atx-heading-space': 'off', // rule is broken
			'markdown/no-missing-label-refs': 'off',
			'markdown/require-alt-text': 'warn',
			'no-irregular-whitespace': 'off', // not supported by markdown parser
			'emptyMarkdownLinks/no-empty-link-text': 'error'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		extends: [svelte.configs.recommended],
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
		},
		rules: {
			// Override or add rule settings here, such as:
			// 'svelte/rule-name': 'error'

			// disabled
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/require-each-key': 'off',

			// enabled
			'svelte/no-restricted-html-elements': [
				'warn',
				{
					elements: ['a'],
					message:
						'Use $lib/components/Link.svelte or $lib/components/LinkWithoutIcon.svelte instead'
				}
			],
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['**/custom'],
							message:
								'This component serves as an adapter for mdsvex, import the corresponding component directly instead'
						}
					]
				}
			]
		}
	},
	{
		rules: {
			// configured
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_'
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
