/**
 * Translation script for the PauseAI website
 *
 * Main entry point for translation operations.
 * Uses modular components to handle different aspects of the translation process.
 */

import dotenv from 'dotenv'
import fs from 'fs/promises'
import minimist from 'minimist'
import path from 'path'

// Import functionality from our own modules
import { createDryRunStats, printDryRunSummary } from './dry-run'
import {
	cleanUpGitSecrets,
	createGitClient,
	getLatestCommitDates,
	GIT_CONFIG,
	initializeGitCache
} from './git-ops'
import { createLlmClient, createRequestQueue, LLM_DEFAULTS } from './llm-client'
import { generateJsonPrompt, generateMarkdownPrompt, generateReviewPrompt } from './prompts'
import { translateOrLoadMarkdown, translateOrLoadMessages } from './translate-core'
import { requireEnvVar } from './utils'

// Import from project modules
import {
	L10NS_BASE_DIR,
	MARKDOWN_L10NS,
	MARKDOWN_SOURCE,
	MESSAGE_L10NS,
	MESSAGE_SOURCE
} from '../../src/lib/l10n.ts'

// This let / try / catch lets the ESM scan succeed in the absence of a runtime
let locales: readonly string[]
try {
	const runtime = await import('../../src/lib/paraglide/runtime.js')
	locales = runtime.locales
	if (runtime.baseLocale !== 'en')
		throw new Error(
			`runtime.baseLocale set to ${runtime.baseLocale} but our code assumes and hardcodes 'en'`
		)

	if (locales.length === 1 && locales[0] === 'en') {
		console.log('No translation needed: en only')
		process.exit(0)
	}
} catch (error) {
	console.error('Failed to read locales from runtime', error.message)
	process.exit(1)
}

import { getDevContext, isDev } from '../../src/lib/env'

// Translation options & debugging configuration
const DEBUG_RETRANSLATE_EVERYTHING = false
const DEBUG_RETRANSLATE_FILES: string[] = [
	'en.json',
	'learn.md',
	'proposal.md',
	'events.md',
	'faq.md',
	'action.md',
	'donate.md',
	'join.md'
]

// Load environment variables
dotenv.config()

// Parse command line arguments
const argv = minimist(process.argv.slice(2))

// Configure dry run mode and verbosity
const DEBUG = argv.mode === 'debug'
const VERBOSE = argv.verbose || DEBUG

// Add dry run mode via CLI flag or for development environments unless forced
const isDryRun = argv.dryRun || (isDev() && process.env.L10N_FORCE_TRANSLATE !== 'true')

// Initialize statistics tracking for dry run mode
const dryRunStats = createDryRunStats()

// Create Git clients
const cacheGit = createGitClient()
const mainGit = createGitClient()

// Repository configuration
const GIT_REPO_PARAGLIDE = 'github.com/PauseAI/paraglide'
const GIT_TOKEN = process.env.GITHUB_TOKEN

// Configure LLM API client
const LLM_API_KEY = requireEnvVar(
	'TRANSLATION_OPENROUTER_API_KEY',
	'dry-run-placeholder',
	isDryRun,
	VERBOSE
)
const llmClient = createLlmClient({
	baseUrl: LLM_DEFAULTS.BASE_URL,
	apiKey: LLM_API_KEY,
	model: LLM_DEFAULTS.MODEL,
	providers: LLM_DEFAULTS.PROVIDERS
})

// Create request queues
const requestQueue = createRequestQueue(LLM_DEFAULTS.REQUESTS_PER_SECOND)
const gitQueue = createRequestQueue(1) // Only one git operation at a time

// Create language name translator
const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })

// Main execution block
{
	// Track cached files count
	let cacheCount = 0

	// Only output file-by-file messages in verbose mode
	const logMessage = (msg: string) => {
		if (VERBOSE || !isDryRun) {
			console.log(msg)
		}
	}

	// Set up translation options
	const translationOptions = {
		isDryRun,
		verbose: VERBOSE,
		llmClient,
		requestQueue,
		gitQueue,
		languageNameGenerator: languageNamesInEnglish,
		cacheGit,
		dryRunStats,
		cacheLatestCommitDates: new Map<string, Date>(),
		mainLatestCommitDates: new Map<string, Date>(),
		debugMode: DEBUG,
		debugRetranslateEverything: DEBUG_RETRANSLATE_EVERYTHING,
		debugRetranslateFiles: DEBUG_RETRANSLATE_FILES
	}

	// Wrap the main execution in an async IIFE
	;(async () => {
		// Get non-English languages directly from compiled runtime
		const languageTags = Array.from(locales).filter((locale) => locale !== 'en')
		console.log(`Translation running in ${isDryRun ? 'DRY RUN' : 'ACTIVE'} mode ${getDevContext()}`)
		console.log(`Using target locales from compiled runtime: [${languageTags.join(', ')}]`)

		await Promise.all([
			(async () => {
				await initializeGitCache({
					dir: L10NS_BASE_DIR,
					token: GIT_TOKEN,
					repo: GIT_REPO_PARAGLIDE,
					username: GIT_CONFIG.USERNAME,
					email: GIT_CONFIG.EMAIL,
					git: cacheGit
				})
				translationOptions.cacheLatestCommitDates = await getLatestCommitDates(cacheGit, 'cache')
			})(),
			(async () =>
				(translationOptions.mainLatestCommitDates = await getLatestCommitDates(mainGit, 'main')))()
		])

		// Process both message files and markdown files in parallel
		// Begin message translation
		const results = await Promise.all([
			(async () => {
				const result = await translateOrLoadMessages(
					{
						sourcePath: MESSAGE_SOURCE,
						languageTags: languageTags,
						promptGenerators: [generateJsonPrompt, generateReviewPrompt],
						targetDir: MESSAGE_L10NS,
						cacheGitCwd: L10NS_BASE_DIR,
						logMessageFn: logMessage
					},
					translationOptions
				)

				// Only copy files in non-dry-run mode
				if (!isDryRun) {
					await fs.cp(MESSAGE_L10NS, L10NS_BASE_DIR, { recursive: true })
				}

				return result
			})(),
			(async () => {
				const markdownPathsFromBase = await fs.readdir(MARKDOWN_SOURCE, { recursive: true })
				const markdownPathsFromRoot = markdownPathsFromBase.map((file) =>
					path.join(MARKDOWN_SOURCE, file)
				)
				return await translateOrLoadMarkdown(
					{
						sourcePaths: markdownPathsFromRoot,
						sourceBaseDir: MARKDOWN_SOURCE,
						languageTags: languageTags,
						promptGenerators: [generateMarkdownPrompt, generateReviewPrompt],
						targetDir: MARKDOWN_L10NS,
						cacheGitCwd: L10NS_BASE_DIR,
						logMessageFn: logMessage
					},
					translationOptions
				)
			})()
		])

		// Sum up cache counts and calculate how many new translations were created
		cacheCount = results.reduce((total, result) => total + result.cacheCount, 0)
		const totalFiles = results.reduce((total, result) => total + result.totalProcessed, 0)
		const newTranslations = totalFiles - cacheCount

		// Only push changes in non-dry-run mode
		if (!isDryRun) {
			// Show a summary of cached translations
			console.log(`\n📦 Translation summary:`)
			if (cacheCount > 0) {
				console.log(`   - ${cacheCount} files used cached translations`)
			}
			console.log(`   - ${newTranslations} files needed new translations`)

			// Only push to Git if we actually created new translations

			// **We need to remove use of a single mainline for the repos very soon!**
			// Currently developers can touch the repos easily, as can previews for pull requests etc.
			// Any subsequent production deploy would show use the altereed in-development translations to viewers

			if (newTranslations > 0) {
				console.log(`\nPushing translation changes to repository...`)
				await cacheGit.push()
			} else {
				console.log(`\nNo new translations to push to repository - skipping Git push.`)
			}
		} else {
			// Print summary for dry run mode
			printDryRunSummary(dryRunStats, VERBOSE, cacheCount)
		}
		if (!isDev()) cleanUpGitSecrets()
	})().catch((error) => {
		console.error('Translation process failed:', error)
		process.exit(1)
	})
}
