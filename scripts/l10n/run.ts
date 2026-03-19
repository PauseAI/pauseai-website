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
import { resolve as resolveForcePatterns, showForceHelp } from './force'
import {
	cleanUpGitSecrets,
	createGitClient,
	getLatestCommitDates,
	GIT_CONFIG,
	initializeGitCage
} from './git-ops'
import { pushWithUpstream } from './branch-safety'
import {
	createConcurrencyQueue,
	createLlmClient,
	createRateLimitingQueue,
	LLM_DEFAULTS
} from './llm-client'
import { Mode } from './mode'
import { generateJsonPrompt, generateMarkdownPrompt, generateReviewPrompt } from './prompts'
import { retrieveMarkdown, retrieveMessages } from './heart'
import type { WorkItem } from './work-plan'
import {
	checkSpendLimit,
	createPlan,
	emptyTodo,
	getSpendLimit,
	printPlanSummary,
	readTodo,
	recordCompletion,
	writeTodo
} from './work-plan'

// Import from project modules
import {
	L10N_CAGE_DIR,
	MARKDOWN_L10NS,
	MARKDOWN_SOURCE,
	MESSAGE_L10NS,
	MESSAGE_SOURCE
} from '../../src/lib/l10n'

// Load environment variables first
dotenv.config()

// Parse command line arguments
const argv = minimist(process.argv.slice(2), {
	boolean: ['dryRun', 'verbose', 'force'],
	string: ['spend']
})

// Handle --force with no patterns (show help)
if (argv.force && argv._.length === 0) {
	showForceHelp()
	process.exit(1)
}

// Validate arguments
const validArgs = ['dryRun', 'verbose', 'force', 'spend', '_']
const unknownArgs = Object.keys(argv).filter((arg) => !validArgs.includes(arg))
if (unknownArgs.length > 0) {
	console.error(`❌ Unknown argument(s): ${unknownArgs.join(', ')}`)
	console.error('\nValid options:')
	console.error('  --dryRun   Run without making changes')
	console.error('  --verbose  Show detailed output')
	console.error('  --force    Force re-l10n with patterns (see --force for help)')
	console.error('  --spend N  Set spend limit in USD (default: $0.10 local, $3.00 CI)')
	process.exit(1)
}

// Parse spend limit
const spendArg = argv.spend !== undefined ? parseFloat(argv.spend) : undefined
if (spendArg !== undefined && (isNaN(spendArg) || spendArg < 0)) {
	console.error('❌ --spend must be a non-negative number')
	process.exit(1)
}

// Ensure inlang settings are current before importing runtime
execSync('tsx scripts/inlang-settings.ts', { stdio: 'inherit' })

// Dynamic import after runtime is generated (ESM scan happens before execSync)
const runtime = await import('../../src/lib/paraglide/runtime.js')

// Verify base locale assumption
if (runtime.baseLocale !== 'en') {
	throw new Error(
		`runtime.baseLocale set to ${runtime.baseLocale} but our code assumes and hardcodes 'en'`
	)
}

const locales = runtime.locales

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

// Create Git clients
const cageGit = createGitClient()
const websiteGit = createGitClient()

// Repository configuration
const GIT_REPO_PARAGLIDE = 'github.com/PauseAI/paraglide'
const GIT_TOKEN = process.env.GITHUB_TOKEN

const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })

// Only output file-by-file messages in verbose mode or when writing
const logMessage = (msg: string) => {
	if (mode.options.verbose || mode.canWrite) {
		console.log(msg)
	}
}

// Main execution
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

	// Get non-English languages directly from compiled runtime
	const targetLocales = Array.from(locales).filter((locale: string) => locale !== 'en')
	console.log(`Using target locales from compiled runtime: [${targetLocales.join(', ')}]`)

	// Initialize git cage and get commit dates (needed for both planning and execution)
	const cageLatestCommitDates = new Map<string, Date>()
	const websiteLatestCommitDates = new Map<string, Date>()

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
			const dates = await getLatestCommitDates(cageGit, 'cage')
			for (const [k, v] of dates) cageLatestCommitDates.set(k, v)
		})(),
		(async () => {
			const dates = await getLatestCommitDates(websiteGit, 'website')
			for (const [k, v] of dates) websiteLatestCommitDates.set(k, v)
		})()
	])

	// --- Phase 1: Plan ---

	// Check for existing work plan
	let plan = readTodo()

	if (!plan) {
		// Generate plan by running retrieve in work-item collection mode
		const workItems: WorkItem[] = []
		const planOptions = {
			isDryRun: true,
			verbose: mode.options.verbose,
			llmClient: null,
			requestQueue: null,
			gitQueue: null,
			languageNameGenerator: languageNamesInEnglish,
			cageGit,
			cageLatestCommitDates,
			websiteLatestCommitDates,
			dryRunStats: null,
			forceFiles,
			workItems,
			modelName: LLM_DEFAULTS.MODEL
		}

		// Scan messages and markdown to collect work items
		const markdownPathsFromBase = await fs.readdir(MARKDOWN_SOURCE, { recursive: true })
		const markdownPathsFromRoot = markdownPathsFromBase.map((file) =>
			path.join(MARKDOWN_SOURCE, file)
		)

		await Promise.all([
			retrieveMessages(
				{
					sourcePath: MESSAGE_SOURCE,
					locales: targetLocales,
					l10nPromptGenerator: generateJsonPrompt,
					reviewPromptGenerator: generateReviewPrompt,
					targetDir: MESSAGE_L10NS,
					cageWorkingDir: L10N_CAGE_DIR,
					logMessageFn: logMessage
				},
				planOptions
			),
			retrieveMarkdown(
				{
					sourcePaths: markdownPathsFromRoot,
					sourceBaseDir: MARKDOWN_SOURCE,
					locales: targetLocales,
					l10nPromptGenerator: generateMarkdownPrompt,
					reviewPromptGenerator: generateReviewPrompt,
					targetDir: MARKDOWN_L10NS,
					cageWorkingDir: L10N_CAGE_DIR,
					logMessageFn: logMessage
				},
				planOptions
			)
		])

		plan = createPlan(mode.branch, LLM_DEFAULTS.MODEL)
		plan.items = workItems

		writeTodo(plan)
		printPlanSummary(plan, mode.options.verbose === true)

		if (plan.items.length === 0) {
			console.log('Nothing to do — all translations are cached.')
			process.exit(0)
		}
	} else {
		console.log('Found existing work plan:')
		printPlanSummary(plan, mode.options.verbose === true)
	}

	// --- Phase 2: Spend gate ---

	if (argv.dryRun) {
		console.log('Dry run — not executing.')
		process.exit(0)
	}

	const spendLimit = getSpendLimit(spendArg, mode.isCI)
	const spendError = checkSpendLimit(plan, spendLimit)
	if (spendError) {
		console.log(spendError)
		process.exit(0)
	}

	// --- Phase 3: Execute ---

	if (!mode.canWrite) {
		console.log('No API key — cannot execute. Use --dryRun to review the plan.')
		process.exit(1)
	}

	// Configure LLM API client
	const llmClient = createLlmClient({
		baseUrl: LLM_DEFAULTS.BASE_URL,
		apiKey: LLM_API_KEY!,
		model: LLM_DEFAULTS.MODEL,
		providers: LLM_DEFAULTS.PROVIDERS
	})

	const requestQueue = createRateLimitingQueue(LLM_DEFAULTS.REQUESTS_PER_SECOND)
	const gitQueue = createConcurrencyQueue(1)

	const executeOptions = {
		isDryRun: false,
		verbose: mode.options.verbose,
		llmClient,
		requestQueue,
		gitQueue,
		languageNameGenerator: languageNamesInEnglish,
		cageGit,
		cageLatestCommitDates,
		websiteLatestCommitDates,
		dryRunStats: null,
		forceFiles
	}

	// Filter source paths to only files in the plan
	const planLocales = [...new Set(plan.items.map((item) => item.locale))]

	const hasMessageItems = plan.items.some((item) => item.source.startsWith('messages/'))
	const markdownPlanPaths = plan.items
		.filter((item) => !item.source.startsWith('messages/'))
		.map((item) => item.source)

	// Execute plan items sequentially
	const results: { cacheCount: number; totalProcessed: number }[] = []

	if (hasMessageItems) {
		results.push(
			await retrieveMessages(
				{
					sourcePath: MESSAGE_SOURCE,
					locales: planLocales,
					l10nPromptGenerator: generateJsonPrompt,
					reviewPromptGenerator: generateReviewPrompt,
					targetDir: MESSAGE_L10NS,
					cageWorkingDir: L10N_CAGE_DIR,
					logMessageFn: logMessage
				},
				executeOptions
			)
		)
	}

	if (markdownPlanPaths.length > 0) {
		results.push(
			await retrieveMarkdown(
				{
					sourcePaths: markdownPlanPaths,
					sourceBaseDir: MARKDOWN_SOURCE,
					locales: planLocales,
					l10nPromptGenerator: generateMarkdownPrompt,
					reviewPromptGenerator: generateReviewPrompt,
					targetDir: MARKDOWN_L10NS,
					cageWorkingDir: L10N_CAGE_DIR,
					logMessageFn: logMessage
				},
				executeOptions
			)
		)
	}

	const cacheCount = results.reduce((total, result) => total + result.cacheCount, 0)
	const totalFiles = results.reduce((total, result) => total + result.totalProcessed, 0)
	const newL10ns = totalFiles - cacheCount

	// Record completion
	recordCompletion(plan.items, plan)
	emptyTodo(mode.branch, LLM_DEFAULTS.MODEL)

	// Summary and push
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

	// Clean up Git secrets in CI environments
	if (mode.isCI) {
		cleanUpGitSecrets()
	}
})().catch((error) => {
	console.error('L10n process failed:', error)
	process.exit(1)
})
