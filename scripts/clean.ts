/**
 * Clean script to remove generated files
 */

import fs from 'fs'
import path from 'path'
import { removeMultiple } from './translation/utils'

console.log('Cleaning generated files...')

removeMultiple(
	[
		'./src/lib/paraglide',
		'./src/paraglide',
		'./src/lib/generated',
		'./build',
		'.svelte-kit',
		'.netlify/functions-internal',
		'./static/pagefind',
		// Our L10N generated files
		'./src/temp/translations',
		'./cache/l10n',
		'.setup-cache',
		'.setup-cache.json',
		'.inlang-settings-cache.json'
	],
	/* description */ undefined,
	/* verbose */ true
)

if (fs.existsSync('./.env')) {
	console.log('💡 .env file maintained')
}

// Suggest reinstalling if old Paraglide was detected
if (fs.existsSync('./node_modules/@inlang/paraglide-js-sveltekit')) {
	console.log('\n⚠️ Old Paraglide 1.x module was detected')
	console.log('💡 To ensure clean upgrade to Paraglide 2.0, run: pnpm install')
}

console.log('Clean completed!')
