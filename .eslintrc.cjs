module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/strict-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
		'plugin:svelte/recommended',
		'plugin:svelte/prettier',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
		project: true,
		tsconfigRootDir: __dirname
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		},
		{
			extends: ['plugin:@typescript-eslint/disable-type-checked'],
			files: ['./svelte.config.js', './create-pagefind-index.js']
		}
	]
}
