import { compile } from '@inlang/paraglide-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { getDevContext, possiblyOverriddenLocales } from '../src/lib/env'
import {
	getDefaultSettings,
	L10N_CAGE_DIR,
	MARKDOWN_L10NS,
	MESSAGE_L10NS,
	MESSAGE_SOURCE,
	writeSettingsFile
} from '../src/lib/l10n'
import { setupL10nCage } from './l10n/git-ops'
import { cullCommentary, createSymlinkIfNeeded, ensureDirectoriesExist } from './l10n/utils'

// Load environment variables from .env file
dotenv.config()

// Configuration - same as in vite.config.ts
const PROJECT_PATH = './project.inlang'
const OUTPUT_PATH = './src/lib/paraglide'
const COMPILE_ARGS = {
	project: PROJECT_PATH,
	outdir: OUTPUT_PATH,
	strategy: ['cookie', 'url', 'preferredLanguage', 'baseLocale'] as (
		| 'cookie'
		| 'url'
		| 'preferredLanguage'
		| 'baseLocale'
		| 'globalVariable'
		| 'localStorage'
	)[]
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

	// Determine if we're allowing l10n generation based on API key presence
	const allowGeneration = !!process.env.TRANSLATION_OPENROUTER_API_KEY
	if (verbose) {
		console.log(`\ud83e\udd16 L10n generation: ${allowGeneration ? 'ENABLED' : 'DISABLED'}`)
	}

	// Force-remove cached l10n-cage in CI to prevent broken Git state
	if (process.env.CI === 'true' && fs.existsSync(L10N_CAGE_DIR)) {
		console.log('🧹 CI: Force-removing cached l10n-cage (prevents broken Git state)')
		fs.rmSync(L10N_CAGE_DIR, { recursive: true, force: true })
	}

	// Create required directories
	if (verbose) console.log('\n\ud83d\udcc1 Creating required directories...')
	ensureDirectoriesExist([L10N_CAGE_DIR, MESSAGE_L10NS, MARKDOWN_L10NS], verbose)

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
			console.log("\n\ud83d\udcdd L10n cage setup skipped - English-only mode doesn't need l10ns")
		}
	} else {
		// Clone or update the l10n cage
		if (verbose)
			console.log(`\n\ud83d\udd04 Setting up l10n cage (need at least ${settings.locales}...`)
		setupL10nCage(L10N_CAGE_DIR, verbose)
		if (verbose) console.log(`\n🧹 Cleaning up l10n files to remove LLM commentary...`)
		for (const locale of settings.locales) {
			if (locale === 'en') continue
			cullCommentary(path.join(MESSAGE_L10NS, `${locale}.json`), verbose)
		}
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

	console.log(`\ud83d\udd04 Compiling Paraglide runtime from settings...`)
	try {
		const routingStrategy = defaultSettings['plugin.paraglide-js-adapter']?.routing?.strategy

		const compileOptions: Parameters<typeof compile>[0] = {
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
			// Fix for Netlify Edge Functions (Deno runtime)
			disableAsyncLocalStorage: true,
			isServer: "typeof window === 'undefined' || 'Deno' in globalThis"
		}

		// Only set urlPatterns for prefix-all-locales strategy
		// Default Paraglide behavior handles regular prefix strategy correctly
		if (routingStrategy === 'prefix-all-locales') {
			compileOptions.urlPatterns = [
				{
					pattern: ':protocol://:domain(.*)::port?/:path(.*)?',
					localized: settings.locales.map((locale) => [
						locale,
						`:protocol://:domain(.*)::port?/${locale}/:path(.*)?`
					])
				}
			]
		}

		compile(compileOptions)
		console.log(`\u2705 Paraglide runtime compiled successfully!`)
	} catch (error) {
		console.error('\u274c Failed to compile Paraglide runtime:', (error as Error).message)
		process.exit(1)
	}
}

// Check if verbose mode is requested
const verbose = process.argv.includes('--verbose')

// Main execution logic - Always regenerate
console.log('Regenerating inlang settings...')
regenerateSettings(verbose)
