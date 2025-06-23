/**
 * Clean script to remove generated files
 */

import fs from 'fs'
import path from 'path'
import { removeMultiple } from './l10n/utils'
import { hasEndangeredL10ns } from './l10n/branch-safety'
import { L10N_CAGE_DIR, MESSAGE_L10NS } from '../src/lib/l10n'

console.log('Cleaning generated files...')

// Remove en.json symlink if it exists (this is always safe to remove during clean)
const enJsonSymlink = path.join(MESSAGE_L10NS, 'en.json')
if (fs.existsSync(enJsonSymlink) && fs.lstatSync(enJsonSymlink).isSymbolicLink()) {
	fs.unlinkSync(enJsonSymlink)
}

// Check for endangered l10ns before cleaning
const endangeredDetails = hasEndangeredL10ns(L10N_CAGE_DIR)
if (endangeredDetails) {
	console.error('\n🚨 WARNING: Endangered l10ns detected!')
	console.error('The l10n cage contains uncommitted changes or unpushed commits that may be lost.')
	console.error('\nDetails:')
	console.error(endangeredDetails)
	console.error('\nTo force clean anyway (MAY LOSE DATA):')
	console.error(`  rm -rf ${L10N_CAGE_DIR}`)
	process.exit(1)
}

removeMultiple(
	[
		'./src/lib/paraglide',
		'./src/paraglide',
		'./src/lib/generated',
		'./build',
		'.svelte-kit',
		'.netlify',
		'./static/pagefind',
		// Our L10N generated files (keep old dir for migration compatibility)
		'./src/temp/translations',
		L10N_CAGE_DIR
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
