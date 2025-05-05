import fs from 'fs'
import dotenv from 'dotenv'
import { execSync } from 'child_process'
import path from 'path'
import { createHash } from 'crypto'
import {
	L10NS_BASE_DIR,
	MESSAGE_L10NS,
	MARKDOWN_L10NS,
	MESSAGE_SOURCE,
	getDefaultSettings,
	writeSettingsFile
} from '../src/lib/l10n'
import { possiblyOverriddenLocales, getDevContext, isDev } from '../src/lib/env'
import { ensureDirectoriesExist, createSymlinkIfNeeded } from './translation/utils'
import { setupTranslationRepo, TRANSLATION_REPO_URL } from './translation/git-ops'
import { compile } from '@inlang/paraglide-js'

// Load environment variables from .env file
dotenv.config()

// Configuration - same as in vite.config.ts
const PROJECT_PATH = './project.inlang'
const OUTPUT_PATH = './src/lib/paraglide'
const COMPILE_ARGS = {
	project: PROJECT_PATH,
	outdir: OUTPUT_PATH,
	strategy: ['cookie', 'url', 'preferredLanguage', 'baseLocale']
}
const CACHE_FILE = './.inlang-settings-cache.json'

/**
 * Generate a hash from the current environment state
 */
function generateEnvHash(): string {
	// Get the actual computed values that affect our decisions
	const defaultSettings = getDefaultSettings()
	const isDevelopment = isDev() // Use the actual isDev() result
	const localesOverride = process.env.PARAGLIDE_LOCALES || ''
	const translationApiKey = process.env.TRANSLATION_OPENROUTER_API_KEY ? 'present' : 'missing'

	// Create a hash of the combined values that actually matter
	const input = JSON.stringify({
		defaults: defaultSettings,
		isDev: isDevelopment,
		localesOverride: localesOverride,
		translationApiKey: translationApiKey,
		compilation: COMPILE_ARGS
	})
	return createHash('md5').update(input).digest('hex')
}

function lastWrittenHash(): string {
	// If cache file doesn't exist, regeneration is needed
	if (!fs.existsSync(CACHE_FILE)) return 'none'
	// Check if the hash matches what's in the cache
	try {
		return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')).hash
	} catch (error) {
		return 'error, regen'
	}
}

function needsRegeneration(): boolean {
	return (
		!fs.existsSync(path.join(PROJECT_PATH, 'settings.json')) ||
		lastWrittenHash() != generateEnvHash()
	)
}

function updateCache(): void {
	const hash = generateEnvHash()
	fs.writeFileSync(
		CACHE_FILE,
		JSON.stringify(
			{
				hash,
				timestamp: new Date().toISOString()
			},
			null,
			2
		)
	)
}

function setupEnglishSupport(verbose: boolean): void {
	// English markdown files are loaded directly from source in routes/[slug]/+page.ts
	if (verbose) console.log('  \u2713 English markdown files will be loaded directly from source')

	// We still need to make the English messages file available for Paraglide
	const enMessageTarget = path.join(MESSAGE_L10NS, 'en.json')
	if (fs.existsSync(MESSAGE_SOURCE)) {
		// Create the symlink for English messages
		createSymlinkIfNeeded(MESSAGE_SOURCE, enMessageTarget, verbose)
	}
}

function regenerateSettings(verbose = false): void {
	// Get default settings from our centralized config
	const defaultSettings = getDefaultSettings()

	// Process the PARAGLIDE_LOCALES environment variable to get active locales
	const settings = { ...defaultSettings }
	settings.locales = possiblyOverriddenLocales(defaultSettings)

	if (verbose) {
		console.info(
			`Env override [${process.env.PARAGLIDE_LOCALES}] (${getDevContext()}) yields ${settings.locales.join(', ')}`
		)
	} else {
		console.log(`Using locales: ${settings.locales.join(', ')}`)
	}

	// Determine if we're allowing translation generation based on API key presence
	const allowGeneration = !!process.env.TRANSLATION_OPENROUTER_API_KEY
	if (verbose) {
		console.log(`\ud83e\udd16 Translation generation: ${allowGeneration ? 'ENABLED' : 'DISABLED'}`)
	}

	// Create required directories
	if (verbose) console.log('\n\ud83d\udcc1 Creating required directories...')
	ensureDirectoriesExist([L10NS_BASE_DIR, MESSAGE_L10NS, MARKDOWN_L10NS], verbose)

	// Create locale-specific directories
	settings.locales.forEach((locale) => {
		// Skip English as we load directly from source
		if (locale === 'en') return

		const localeDir = path.join(MARKDOWN_L10NS, locale)
		ensureDirectoriesExist([localeDir], verbose)
	})

	// Skip repository setup if we're only using English
	if (settings.locales.length === 1 && settings.locales[0] === 'en') {
		if (verbose) {
			console.log(
				"\n\ud83d\udcdd Translation repository setup skipped - English-only mode doesn't need translations"
			)
		}
	} else {
		// Clone or update the translation repository
		if (verbose)
			console.log(
				`\n\ud83d\udd04 Setting up translation repository (need at least ${settings.locales}...`
			)
		setupTranslationRepo(L10NS_BASE_DIR, verbose)
	}

	// For English locale, we only need to provide messages file for Paraglide
	if (settings.locales.includes('en')) {
		if (verbose) console.log('\n\ud83d\udccb Setting up English language support...')
		setupEnglishSupport(verbose)
	}

	// Write the settings file
	writeSettingsFile(settings)
	console.log(`Generated settings.json with ${settings.locales.length} locales`)

	// Write settings for browser-side code to access
	const settingsForBrowser = path.join('./src/lib/generated/paraglide-defaults.js')
	// Create the directory if it doesn't exist
	fs.mkdirSync(path.dirname(settingsForBrowser), { recursive: true })
	// Write the file
	fs.writeFileSync(settingsForBrowser, 'export default ' + JSON.stringify(defaultSettings, null, 2))

	if (verbose) {
		console.log(`Copied default settings to browser-accessible location: ${settingsForBrowser}`)
	}

	console.log(
		`\ud83d\udd04 Compiling Paraglide runtime from settings... (was: ${lastWrittenHash()})`
	)
	try {
		// Run the Paraglide compiler with the necessary Node.js flags
		compile(COMPILE_ARGS)
		console.log(`\u2705 Paraglide runtime compiled successfully! (now: ${generateEnvHash()})`)
		updateCache()
	} catch (error) {
		console.error('\u274c Failed to compile Paraglide runtime:', (error as Error).message)
		process.exit(1)
	}
}

// Check if verbose mode is requested
const verbose = process.argv.includes('--verbose')
const forceRun = process.argv.includes('--force')

// Main execution logic - Check if we need to regenerate and do so if needed
if (forceRun || needsRegeneration()) {
	if (forceRun) {
		console.log('Force regeneration of inlang settings...')
	} else {
		console.log('Environment changes detected, regenerating inlang settings...')
	}
	regenerateSettings(verbose)
} else {
	if (verbose) console.log(`\ud83d\udd0d Inlang settings unchanged`)
}

// Export the main function for programmatic usage
export { regenerateSettings }
