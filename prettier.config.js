import gitignore from 'eslint-config-flat-gitignore'
import { globbySync } from 'globby'

const MANUAL_IGNORES = ['pnpm-lock.yaml', 'src/lib/components/widget-consent/loadTwitter.js']

const ignored = [
	...gitignore({
		files: globbySync('**/.gitignore', { ignore: ['**/node_modules'] })
	}).ignores.filter((p) => !p.startsWith('!')),
	...MANUAL_IGNORES
]

/** @type {import("prettier").Config} */
export default {
	semi: false,
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	endOfLine: 'auto',
	plugins: ['prettier-plugin-svelte'],
	overrides: [
		{
			files: '*.svelte',
			options: {
				parser: 'svelte'
			}
		},
		{
			files: ignored,
			options: {
				requirePragma: true
			}
		}
	]
}
