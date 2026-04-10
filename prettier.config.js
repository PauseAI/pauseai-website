import { getNegativeIgnores, getPositiveIgnores } from './scripts/ignores.js'

const MANUAL_IGNORES = [
	'pnpm-lock.yaml',
	'src/lib/components/widget-consent/loadTwitter.js',
	'project.inlang/.meta.json' // not recognized from gitignore patterns
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
			files: [...getPositiveIgnores(), ...MANUAL_IGNORES],
			options: {
				requirePragma: true
			}
		},
		{
			files: getNegativeIgnores(),
			options: {
				requirePragma: false
			}
		}
	]
}
