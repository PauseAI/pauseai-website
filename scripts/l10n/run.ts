/**
 * L10n script for the PauseAI website
 *
 * Main entry point for l10n operations.
 * Uses modular components to handle different aspects of the l10n process.
 */

import dotenv from 'dotenv'
import fs from 'fs/promises'
import minimist from 'minimist'
import path from 'path'
import { execSync } from 'child_process'

// Import functionality from our own modules
import { createDryRunStats, printDryRunSummary } from './dry-run'
import { resolve as resolveForcePatterns, showForceHelp } from './force'
import {
	cleanUpGitSecrets,
	createGitClient,
	getLatestCommitDates,
	GIT_CONFIG,
	initializeGitCage
} from './git-ops'
import { l10nCageBranch, pushWithUpstream } from './branch-safety'
import { createLlmClient, createRequestQueue, LLM_DEFAULTS } from './llm-client'
import { Mode } from './mode'
import { generateJsonPrompt, generateMarkdownPrompt, generateReviewPrompt } from './prompts'
import { retrieveMarkdown, retrieveMessages } from './heart'

// Import from project modules
import {
	L10N_CAGE_DIR,
	MARKDOWN_L10NS,
	MARKDOWN_SOURCE,
	MESSAGE_L10NS,
	MESSAGE_SOURCE
} from '../../src/lib/l10n.ts'

// Load environment variables first
dotenv.config()

// Parse command line arguments
const argv = minimist(process.argv.slice(2), {
	boolean: ['dryRun', 'verbose', 'force']
})

// Handle --force with no patterns (show help)
if (argv.force && argv._.length === 0) {
	showForceHelp()
	process.exit(1)
}

// Validate arguments
const validArgs = ['dryRun', 'verbose', 'force', '_']
const unknownArgs = Object.keys(argv).filter((arg) => !validArgs.includes(arg))
if (unknownArgs.length > 0) {
	console.error(`❌ Unknown argument(s): ${unknownArgs.join(', ')}`)
	console.error('\nValid options:')
	console.error('  --dryRun   Run without making changes')
	console.error('  --verbose  Show detailed output')
	console.error('  --force    Force re-l10n with patterns (see --force for help)')
	process.exit(1)
}

// Ensure inlang settings are current before importing runtime
execSync('tsx scripts/inlang-settings.ts', { stdio: 'ignore' })

// This let / try / catch lets the ESM scan succeed in the absence of a runtime
let locales: readonly string[]
try {
	const runtime = await import('../../src/lib/paraglide/runtime.js')
	locales = runtime.locales
	if (runtime.baseLocale !== 'en')
		throw new Error(
			`runtime.baseLocale set to ${runtime.baseLocale} but our code assumes and hardcodes 'en'`
		)
} catch (error) {
	console.error('Failed to read locales from runtime', error.message)
	process.exit(1)
}

// Get API key early for mode determination
const LLM_API_KEY = process.env.L10N_OPENROUTER_API_KEY

// Determine l10n mode
const mode = new Mode({
	locales,
	apiKey: LLM_API_KEY,
	isDryRun: argv.dryRun === true,
	verbose: argv.verbose === true,
	force: argv.force === true,
	forceFiles: argv._ // Files passed as positional arguments
})

// Announce what we're going to do
mode.announce()

// Exit early for en-only mode
if (mode.mode === 'en-only') {
	process.exit(0)
}

// L10n options configuration

// Initialize statistics tracking for dry run mode
const dryRunStats = createDryRunStats()

// Create Git clients
const cageGit = createGitClient()
const websiteGit = createGitClient()

// Repository configuration
const GIT_REPO_PARAGLIDE = 'github.com/PauseAI/paraglide'
const GIT_TOKEN = process.env.GITHUB_TOKEN

// Configure LLM API client
// For read-only/dry-run modes, we use a placeholder key
const llmClient = createLlmClient({
	baseUrl: LLM_DEFAULTS.BASE_URL,
	apiKey: mode.canWrite ? LLM_API_KEY : 'dry-run-placeholder',
	model: LLM_DEFAULTS.MODEL,
	providers: LLM_DEFAULTS.PROVIDERS
})

// Create request queues
const requestQueue = createRequestQueue(LLM_DEFAULTS.REQUESTS_PER_SECOND)
const gitQueue = createRequestQueue(1) // Only one git operation at a time

const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })

// Main execution block
{
	// Track cached files count
	let cacheCount = 0

	// Only output file-by-file messages in verbose mode or when writing
	const logMessage = (msg: string) => {
		if (mode.options.verbose || mode.canWrite) {
			console.log(msg)
		}
	}

	// Wrap the main execution in an async IIFE
	;(async () => {
		// Resolve force patterns if force mode is enabled
		let forceFiles: string[] = []
		if (mode.options.force) {
			forceFiles = await resolveForcePatterns(argv._, MARKDOWN_SOURCE)
			if (forceFiles.length > 0) {
				console.log(`🔄 Force mode: Will re-l10n [${forceFiles.join(', ')}]`)
			} else {
				console.warn(`⚠️  Force patterns matched no files: [${argv._.join(', ')}]`)
			}
		}

		const options = {
			isDryRun: !mode.canWrite,
			verbose: mode.options.verbose,
			llmClient,
			requestQueue,
			gitQueue,
			languageNameGenerator: languageNamesInEnglish,
			cageGit,
			dryRunStats,
			cageLatestCommitDates: new Map<string, Date>(),
			websiteLatestCommitDates: new Map<string, Date>(),
			forceFiles: forceFiles
		}

		// Get non-English languages directly from compiled runtime
		const targetLocales = Array.from(locales).filter((locale) => locale !== 'en')
		console.log(`Using target locales from compiled runtime: [${targetLocales.join(', ')}]`)

		await Promise.all([
			(async () => {
				await initializeGitCage({
					dir: L10N_CAGE_DIR,
					token: GIT_TOKEN,
					repo: GIT_REPO_PARAGLIDE,
					username: GIT_CONFIG.USERNAME,
					email: GIT_CONFIG.EMAIL,
					git: cageGit
				})
				options.cageLatestCommitDates = await getLatestCommitDates(cageGit, 'cage')
			})(),
			(async () =>
				(options.websiteLatestCommitDates = await getLatestCommitDates(websiteGit, 'website')))()
		])

		// Process both message files and markdown files in parallel
		// Begin message l10n
		const results = await Promise.all([
			(async () => {
				const result = await retrieveMessages(
					{
						sourcePath: MESSAGE_SOURCE,
						locales: targetLocales,
						promptGenerators: [generateJsonPrompt, generateReviewPrompt],
						targetDir: MESSAGE_L10NS,
						cageWorkingDir: L10N_CAGE_DIR,
						logMessageFn: logMessage
					},
					options
				)

				// Files are already in the correct location for paraglide to find them

				return result
			})(),
			(async () => {
				const markdownPathsFromBase = await fs.readdir(MARKDOWN_SOURCE, { recursive: true })
				const markdownPathsFromRoot = markdownPathsFromBase.map((file) =>
					path.join(MARKDOWN_SOURCE, file)
				)
				return await retrieveMarkdown(
					{
						sourcePaths: markdownPathsFromRoot,
						sourceBaseDir: MARKDOWN_SOURCE,
						locales: targetLocales,
						promptGenerators: [generateMarkdownPrompt, generateReviewPrompt],
						targetDir: MARKDOWN_L10NS,
						cageWorkingDir: L10N_CAGE_DIR,
						logMessageFn: logMessage
					},
					options
				)
			})()
		])

		// Sum up cache counts and calculate how many new l10ns were created
		cacheCount = results.reduce((total, result) => total + result.cacheCount, 0)
		const totalFiles = results.reduce((total, result) => total + result.totalProcessed, 0)
		const newL10ns = totalFiles - cacheCount

		// Only push changes in write mode
		if (mode.canWrite) {
			// Show a summary of cached l10ns
			console.log(`\n📦 L10n summary:`)
			if (cacheCount > 0) {
				console.log(`   - ${cacheCount} files used cached l10ns`)
			}
			console.log(`   - ${newL10ns} files needed new l10ns`)

			if (newL10ns > 0) {
				console.log(`\nPushing l10n changes to remote cage...`)
				await pushWithUpstream(cageGit, mode.options.verbose)
			} else {
				console.log(`\nNo new l10ns to push to remote cage - skipping Git push.`)
			}
		} else {
			// Print summary for read-only/dry-run mode
			printDryRunSummary(dryRunStats, mode.options.verbose, cacheCount)
		}

		// Clean up Git secrets in CI environments to prevent secret persistence
		if (mode.isCI) {
			cleanUpGitSecrets()
		}
	})().catch((error) => {
		console.error('L10n process failed:', error)
		process.exit(1)
	})
}
