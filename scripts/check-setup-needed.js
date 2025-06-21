// @ts-check
/**
 * This script checks if setup needs to be run based on .env settings
 */

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { execSync } from 'child_process'
import { L10N_CAGE_DIR, MARKDOWN_L10NS } from '../src/lib/l10n.ts'

dotenv.config()

const runtimeModule = await import('../src/lib/paraglide/runtime.js')
let activeLocales = Array.from(runtimeModule.locales)
let setupNeeded = false
let reason = ''

if (!fs.existsSync(L10N_CAGE_DIR)) {
	setupNeeded = true
	reason = `Basic setup directory not found (${L10N_CAGE_DIR})`
}

const nonEnglishLocales = activeLocales.filter((locale) => locale !== 'en')
if (nonEnglishLocales.length > 0) {
	// If we need non-English locales, check if directories exist
	if (!fs.existsSync(MARKDOWN_L10NS)) {
		setupNeeded = true
		reason = `Translations directory not found (${MARKDOWN_L10NS})`
	} else {
		const existingDirs = fs
			.readdirSync(MARKDOWN_L10NS)
			.filter((f) => fs.statSync(path.join(MARKDOWN_L10NS, f)).isDirectory())

		const missingLocales = nonEnglishLocales.filter((locale) => !existingDirs.includes(locale))
		if (missingLocales.length > 0) {
			setupNeeded = true
			reason = `Missing locale directories: ${missingLocales.join(', ')}`
		}
	}
}

// Always check if translations repo is needed but missing
if (activeLocales.length > 1 && !fs.existsSync(path.join(L10N_CAGE_DIR, '.git'))) {
	setupNeeded = true
	reason = 'Translation repository not found'
}

// Check if English messages file is available for Paraglide
const enMessageTarget = path.join(L10N_CAGE_DIR, 'json', 'en.json')
if (!fs.existsSync(enMessageTarget)) {
	setupNeeded = true
	reason = 'English messages file not found'
}

// Check for completely fresh installation - if SVelteKit dir doesn't exist, always run setup
if (!fs.existsSync('.svelte-kit')) {
	setupNeeded = true
	reason = 'Fresh installation (no .svelte-kit directory)'
}

// Add debug info to help with diagnostics
console.log('\n🔍 Environment check:')
console.log(`- Active locales: ${activeLocales.join(', ')}`)
console.log(`- SvelteKit initialized: ${fs.existsSync('.svelte-kit') ? 'yes ✓' : 'no ❌'}`)
console.log(
	`- Base directory (${L10N_CAGE_DIR}): ${fs.existsSync(L10N_CAGE_DIR) ? 'exists ✓' : 'missing ❌'}`
)
console.log(
	`- English messages (${enMessageTarget}): ${fs.existsSync(enMessageTarget) ? 'exists ✓' : 'missing ❌'}`
)

if (nonEnglishLocales.length > 0) {
	console.log(`- Non-English locales needed: ${nonEnglishLocales.join(', ')}`)
	if (fs.existsSync(MARKDOWN_L10NS)) {
		const existingDirs = fs
			.readdirSync(MARKDOWN_L10NS)
			.filter((f) => fs.statSync(path.join(MARKDOWN_L10NS, f)).isDirectory())
		console.log(`- Available locale directories: ${existingDirs.join(', ') || 'none'}`)
	} else {
		console.log(`- Translations directory (${MARKDOWN_L10NS}): missing ❌`)
	}
}

// If setup is needed, run it
if (setupNeeded) {
	console.log(`\n🔄 Setup needed: ${reason}`)
	console.log('\n🔄 Running setup to ensure configuration matches .env settings...')

	try {
		execSync('pnpm setup', { stdio: 'inherit' })
	} catch (error) {
		console.error('❌ Setup failed:', error.message)
		process.exit(1)
	}
} else {
	console.log('\n✅ Environment properly configured, proceeding with development server')
}
