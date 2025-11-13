// @ts-check
/**
 * This script checks if setup needs to be run based on .env settings
 */

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { execSync } from 'child_process'
import { L10N_CAGE_DIR, MARKDOWN_L10NS } from '../src/lib/l10n'
import { importRuntimeWithoutVite } from './l10n/utils'

dotenv.config()

const runtimeModule = await importRuntimeWithoutVite()
let activeLocales = Array.from(runtimeModule.locales)
const baseLocale = runtimeModule.baseLocale ?? 'en'
let setupNeeded = false
let reason = ''

if (!fs.existsSync(L10N_CAGE_DIR)) {
	setupNeeded = true
	reason = `Basic setup directory not found (${L10N_CAGE_DIR})`
}

const nonBaseLocales = activeLocales.filter((locale) => locale !== baseLocale)
if (nonBaseLocales.length > 0) {
	// If we need additional locales, check if directories exist
	if (!fs.existsSync(MARKDOWN_L10NS)) {
		setupNeeded = true
		reason = `Translations directory not found (${MARKDOWN_L10NS})`
	} else {
		const existingDirs = fs
			.readdirSync(MARKDOWN_L10NS)
			.filter((f) => fs.statSync(path.join(MARKDOWN_L10NS, f)).isDirectory())

		const missingLocales = nonBaseLocales.filter((locale) => !existingDirs.includes(locale))
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

// Check if base-locale messages file is available for Paraglide
const baseMessageTarget = path.join(L10N_CAGE_DIR, 'json', `${baseLocale}.json`)
if (!fs.existsSync(baseMessageTarget)) {
	setupNeeded = true
	reason = `Base locale (${baseLocale}) messages file not found`
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
	`- ${baseLocale} messages (${baseMessageTarget}): ${fs.existsSync(baseMessageTarget) ? 'exists ✓' : 'missing ❌'}`
)

if (nonBaseLocales.length > 0) {
	console.log(`- Additional locales needed: ${nonBaseLocales.join(', ')}`)
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
	} catch (/** @type {unknown} */ error) {
		if (error instanceof Error) console.error('❌ Setup failed:', error.message)
		else console.error('❌ Setup failed with unknown error:', error)
		process.exit(1)
	}
} else {
	console.log('\n✅ Environment properly configured, proceeding with development server')
}
