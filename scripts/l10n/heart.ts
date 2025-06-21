/**
 * Core l10n logic
 * Handles the main l10n workflow and file operations
 */

import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import PQueue from 'p-queue'
import { SimpleGit } from 'simple-git'
import { PromptGenerator } from './prompts'
import { postChatCompletion } from './llm-client'
import { getCommitMessage } from './git-ops'
import { preprocessMarkdown, postprocessMarkdown, extractWebPath, placeInCage } from './utils'
import { trackL10n, Stats } from './dry-run'

/**
 * Type definition for target path locator function
 */
export type Targeting = (locale: string, sourcePath: string) => string

/**
 * Configuration options for l10n operations
 */
export interface Options {
	/** Whether to run in dry run mode (skip actual API calls) */
	isDryRun: boolean
	/** Whether to output verbose logs */
	verbose: boolean
	/** Axios client for LLM API requests */
	llmClient: any
	/** Queue for managing API request rate limiting */
	requestQueue: PQueue
	/** Queue for Git operations to prevent concurrency issues */
	gitQueue: PQueue
	/** Function to generate language names from language codes */
	languageNameGenerator: Intl.DisplayNames
	/** Git client for the l10n cage */
	cageGit: SimpleGit
	/** Map of latest commit dates in the l10n cage */
	cageLatestCommitDates: Map<string, Date>
	/** Map of latest commit dates in the website repository */
	websiteLatestCommitDates: Map<string, Date>
	/** Statistics object for dry run mode */
	dryRunStats: Stats
	/** List of files to force re-l10n (ignore cache) */
	forceFiles: string[]
}

/**
 * Localizes the provided content to a specified language using a two-pass process,
 * or collects statistics in dry run mode without making API calls.
 *
 * @param content - The original content to be localized.
 * @param promptGenerators - Functions for generating the l10n and review prompt.
 * @param locale - The target locale code.
 * @param promptAdditions - Additional context to include in the prompt.
 * @param options - L10n configuration options.
 * @param filePath - Optional file path for dry run statistics.
 * @returns A Promise that resolves to the reviewed (final) l10n, or a placeholder in dry run mode.
 * @throws {Error} If either the l10n or review pass fails (in non-dry run mode).
 */
export async function l10nFromLLM(
	content: string,
	promptGenerators: PromptGenerator[],
	locale: string,
	promptAdditions: string,
	options: Options,
	filePath?: string
): Promise<string> {
	const languageName = options.languageNameGenerator.of(locale)
	if (!languageName) throw new Error(`Couldn't resolve locale code: ${locale}`)

	const l10nPrompt = promptGenerators[0](languageName, content, promptAdditions)
	// L10n prompt ready

	// In dry run mode, collect statistics instead of making API calls
	if (options.isDryRun) {
		// Track what would be localized for reporting
		trackL10n(options.dryRunStats, content, locale, filePath)

		if (options.verbose) {
			console.log(
				`🔍 [DRY RUN] Would localize ${content.length} characters to ${languageName}${filePath ? ` (${path.basename(filePath)})` : ''}`
			)
		}

		// Return a placeholder for localized content
		return `[DRY RUN L10N PLACEHOLDER for ${languageName}]`
	}

	// Regular API-based l10n for non-dry-run mode
	// First pass: generate initial l10n
	const firstPass = await postChatCompletion(options.llmClient, options.requestQueue, [
		{ role: 'user', content: l10nPrompt }
	])

	if (!firstPass) throw new Error(`L10n to ${languageName} failed`)

	if (options.verbose) {
		console.log('First prompt: ', l10nPrompt)
		console.log('First pass response:', firstPass)
	} else {
		console.log(
			`Completed first pass l10n to ${languageName}${filePath ? ` for ${path.basename(filePath)}` : ''}`
		)
	}

	// Second pass: review and refine l10n with context
	const reviewPrompt = promptGenerators[1](languageName)
	const reviewed = await postChatCompletion(options.llmClient, options.requestQueue, [
		{ role: 'user', content: l10nPrompt },
		{ role: 'assistant', content: firstPass },
		{ role: 'user', content: reviewPrompt }
	])

	if (!reviewed) throw new Error(`Review of ${languageName} l10n failed`)

	if (options.verbose) {
		console.log('Review prompt: ', reviewPrompt)
		console.log('Review pass response:', reviewed)
	} else {
		console.log(
			`Completed review pass l10n to ${languageName}${filePath ? ` for ${path.basename(filePath)}` : ''}`
		)
	}

	return reviewed
}

/**
 * Retrieves localized message files using a JSON prompt generator.
 * Processes the source JSON file and creates separate l10ns for each target language.
 *
 * @param options - An object containing the source path, locales, prompt generator, target directory, and cache working directory.
 * @param options - Global l10n configuration options
 * @returns A Promise that resolves with results of the operation
 */
export async function retrieveMessages(
	params: {
		sourcePath: string
		locales: string[]
		promptGenerators: PromptGenerator[]
		targetDir: string
		cageWorkingDir: string
		logMessageFn?: (msg: string) => void
	},
	options: Options
): Promise<{ cacheCount: number; totalProcessed: number }> {
	const result = await retrieve(
		{
			sourcePaths: [params.sourcePath],
			locales: params.locales,
			promptGenerators: params.promptGenerators,
			locateTarget: (locale) => path.join(params.targetDir, locale + '.json'),
			cageWorkingDir: params.cageWorkingDir,
			logMessageFn: params.logMessageFn
		},
		options
	)
	return { cacheCount: result.cacheCount, totalProcessed: result.totalProcessed }
}

/**
 * Retrieves localized markdown files using a Markdown prompt generator.
 * Reads markdown files from the source directory and outputs localized files organized by language.
 *
 * @param options - An object with sourcePaths, sourceBaseDir, locales, prompt generator, target directory, and cache working directory.
 * @param l10nOptions - Global l10n configuration options
 * @returns A Promise that resolves with results of the operation
 */
export async function retrieveMarkdown(
	params: {
		sourcePaths: string[]
		sourceBaseDir: string
		locales: string[]
		promptGenerators: PromptGenerator[]
		targetDir: string
		cageWorkingDir: string
		logMessageFn?: (msg: string) => void
	},
	options: Options
): Promise<{ cacheCount: number; totalProcessed: number }> {
	const result = await retrieve(
		{
			sourcePaths: params.sourcePaths,
			locales: params.locales,
			promptGenerators: params.promptGenerators,
			locateTarget: (locale, sourcePath) => {
				const relativePath = path.relative(params.sourceBaseDir, sourcePath)
				return path.join(params.targetDir, locale, relativePath)
			},
			cageWorkingDir: params.cageWorkingDir,
			logMessageFn: params.logMessageFn
		},
		options
	)
	return { cacheCount: result.cacheCount, totalProcessed: result.totalProcessed }
}

/**
 * Generalized function that retrieves localized files for various languages.
 * It checks whether a cached l10n is up-to-date before generating a new l10n.
 *
 * @param options - An object containing source file paths, locales, prompt generator, target locator, and the cache working directory.
 * @param l10nOptions - Global l10n configuration options
 * @returns A Promise that resolves with the results of the operation
 */
export async function retrieve(
	params: {
		sourcePaths: string[]
		locales: string[]
		promptGenerators: PromptGenerator[]
		locateTarget: Targeting
		cageWorkingDir: string
		logMessageFn?: (msg: string) => void
	},
	options: Options
): Promise<{ cacheCount: number; totalProcessed: number }> {
	const log = params.logMessageFn || console.log
	// Log function ready
	let done = 1
	let total = 0
	let cacheCount = 0

	await Promise.all(
		params.sourcePaths.map(async (sourcePath) => {
			const sourceFileName = path.basename(sourcePath)
			/** Backslash to forward slash to match Git log and for web path */
			const processedSourcePath = path.relative('.', sourcePath).replaceAll(/\\/g, '/')
			await Promise.all(
				params.locales.map(async (locale) => {
					const targetPath = params.locateTarget(locale, sourcePath)
					let useCachedL10n = false
					let fileExists = false

					// Check if this file is being forced (skip cache)
					const sourceFileName = path.basename(sourcePath)
					const isForced = options.forceFiles.includes(sourceFileName)

					// Check if target file exists (needed for commit messages)
					if (fsSync.existsSync(targetPath)) {
						fileExists = true
					}

					if (isForced) {
						if (options.verbose) {
							log(`🔄 Force mode: Skipping cache for ${sourceFileName}`)
						}
					}

					// Check if we can use the cached l10n (unless forced)
					if (!isForced && fileExists) {
						const sourceLatestCommitDate = options.websiteLatestCommitDates.get(processedSourcePath)
						if (!sourceLatestCommitDate) {
							log(
								`Didn't prepare latest commit date for ${processedSourcePath}, use Cached version`
							)
							useCachedL10n = true
							cacheCount++ // PATCH: Count uncommitted files as cached
						} else {
							// Only compare dates if source has a commit date
							const cageRelativePath = path
								.relative(params.cageWorkingDir, targetPath)
								.replaceAll(/\\/g, '/')
							const cageLatestCommitDate = options.cageLatestCommitDates.get(cageRelativePath)
							if (!cageLatestCommitDate)
								throw new Error(`Didn't prepare latest commit date for ${targetPath}`)
							if (cageLatestCommitDate > sourceLatestCommitDate) {
								useCachedL10n = true
								cacheCount++
							}
						}
					}

					// If we can't use cache, generate a new l10n
					if (!useCachedL10n) {
						total++
						const content = await fs.readFile(sourcePath, 'utf-8')
						const processedContent = preprocessMarkdown(content)

						if (options.verbose) {
							log(processedContent)
						}

						const page = extractWebPath(sourcePath)
						const promptAdditions = '' // Will be handled by the prompt generator

						const capturedL10n = await l10nFromLLM(
							processedContent,
							params.promptGenerators,
							locale,
							promptAdditions,
							options,
							sourcePath
						)

						// Only perform actual file writes and Git operations in non-dry run mode
						if (!options.isDryRun) {
							const groomedL10n = postprocessMarkdown(processedContent, capturedL10n)
							await placeInCage(targetPath, groomedL10n)

							const message = getCommitMessage(sourceFileName, locale, fileExists)
							try {
								await options.gitQueue.add(() =>
									(fileExists ? options.cageGit : options.cageGit.add('.')).commit(message, ['-a'])
								)
							} catch (e) {
								if (e instanceof Error && e.message.includes('nothing to commit')) {
									log(`${sourceFileName} in ${locale} didn't change`)
								} else {
									throw e
								}
							}
							log(`${message} (${done++} / ${total})`)
						}
					}
				})
			)
		})
	)

	// Total count of processed files is the count of source files multiplied by target languages
	const totalProcessed = params.sourcePaths.length * params.locales.length
	return { cacheCount, totalProcessed }
}
