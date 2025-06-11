/**
 * Core translation logic
 * Handles the main translation workflow and file operations
 */

import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import PQueue from 'p-queue'
import { SimpleGit } from 'simple-git'
import { PromptGenerator } from './prompts'
import { postChatCompletion } from './llm-client'
import { getCommitMessage } from './git-ops'
import { preprocessMarkdown, postprocessMarkdown, extractWebPath, writeFileWithDir } from './utils'
import { trackTranslation } from './dry-run'

/**
 * Type definition for target path strategy function
 */
export type TargetStrategy = (language: string, sourcePath: string) => string

/**
 * Configuration options for translation operations
 */
export interface TranslationOptions {
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
	/** Git client for the cache repository */
	cacheGit: SimpleGit
	/** Map of latest commit dates in the cache repository */
	cacheLatestCommitDates: Map<string, Date>
	/** Map of latest commit dates in the source repository */
	mainLatestCommitDates: Map<string, Date>
	/** Statistics object for dry run mode */
	dryRunStats: any
}

/**
 * Translates the provided content to a specified language using a two-pass process,
 * or collects statistics in dry run mode without making API calls.
 *
 * @param content - The original content to be translated.
 * @param promptGenerators - Functions for generating the translation and review prompt.
 * @param language - The target language code.
 * @param promptAdditions - Additional context to include in the prompt.
 * @param options - Translation configuration options.
 * @param filePath - Optional file path for dry run statistics.
 * @returns A Promise that resolves to the reviewed (final) translation, or a placeholder in dry run mode.
 * @throws {Error} If either the translation or review pass fails (in non-dry run mode).
 */
export async function translate(
	content: string,
	promptGenerators: PromptGenerator[],
	language: string,
	promptAdditions: string,
	options: TranslationOptions,
	filePath?: string
): Promise<string> {
	const languageName = options.languageNameGenerator.of(language)
	if (!languageName) throw new Error(`Couldn't resolve language code: ${language}`)

	const translationPrompt = promptGenerators[0](languageName, content, promptAdditions)
	// Translation prompt ready

	// In dry run mode, collect statistics instead of making API calls
	if (options.isDryRun) {
		// Track what would be translated for reporting
		trackTranslation(options.dryRunStats, content, language, filePath)

		if (options.verbose) {
			console.log(
				`🔍 [DRY RUN] Would translate ${content.length} characters to ${languageName}${filePath ? ` (${path.basename(filePath)})` : ''}`
			)
		}

		// Return a placeholder for translated content
		return `[DRY RUN TRANSLATION PLACEHOLDER for ${languageName}]`
	}

	// Regular API-based translation for non-dry-run mode
	// First pass: generate initial translation
	const firstPass = await postChatCompletion(options.llmClient, options.requestQueue, [
		{ role: 'user', content: translationPrompt }
	])

	if (!firstPass) throw new Error(`Translation to ${languageName} failed`)

	if (options.verbose) {
		console.log('First prompt: ', translationPrompt)
		console.log('First pass response:', firstPass)
	} else {
		console.log(
			`Completed first pass translation to ${languageName}${filePath ? ` for ${path.basename(filePath)}` : ''}`
		)
	}

	// Secon d pass: review and refine translation with context
	const reviewPrompt = promptGenerators[1](languageName)
	const reviewed = await postChatCompletion(options.llmClient, options.requestQueue, [
		{ role: 'user', content: translationPrompt },
		{ role: 'assistant', content: firstPass },
		{ role: 'user', content: reviewPrompt }
	])

	if (!reviewed) throw new Error(`Review of ${languageName} translation failed`)

	if (options.verbose) {
		console.log('Review prompt: ', reviewPrompt)
		console.log('Review pass response:', reviewed)
	} else {
		console.log(
			`Completed review pass translation to ${languageName}${filePath ? ` for ${path.basename(filePath)}` : ''}`
		)
	}

	return reviewed
}

/**
 * Translates or loads message files using a JSON prompt generator.
 * Processes the source JSON file and creates separate translations for each target language.
 *
 * @param options - An object containing the source path, language tags, prompt generator, target directory, and cache working directory.
 * @param translationOptions - Global translation configuration options
 * @returns A Promise that resolves with results of the operation
 */
export async function translateOrLoadMessages(
	options: {
		sourcePath: string
		languageTags: string[]
		promptGenerators: PromptGenerator[]
		targetDir: string
		cacheGitCwd: string
		logMessageFn?: (msg: string) => void
	},
	translationOptions: TranslationOptions
): Promise<{ cacheCount: number; totalProcessed: number }> {
	const result = await translateOrLoad(
		{
			sourcePaths: [options.sourcePath],
			languageTags: options.languageTags,
			promptGenerators: options.promptGenerators,
			targetStrategy: (language) => path.join(options.targetDir, language + '.json'),
			cacheGitCwd: options.cacheGitCwd,
			logMessageFn: options.logMessageFn
		},
		translationOptions
	)
	return { cacheCount: result.cacheCount, totalProcessed: result.totalProcessed }
}

/**
 * Translates or loads markdown files using a Markdown prompt generator.
 * Reads markdown files from the source directory and outputs translated files organized by language.
 *
 * @param options - An object with sourcePaths, sourceBaseDir, language tags, prompt generator, target directory, and cache working directory.
 * @param translationOptions - Global translation configuration options
 * @returns A Promise that resolves with results of the operation
 */
export async function translateOrLoadMarkdown(
	options: {
		sourcePaths: string[]
		sourceBaseDir: string
		languageTags: string[]
		promptGenerators: PromptGenerator[]
		targetDir: string
		cacheGitCwd: string
		logMessageFn?: (msg: string) => void
	},
	translationOptions: TranslationOptions
): Promise<{ cacheCount: number; totalProcessed: number }> {
	const result = await translateOrLoad(
		{
			sourcePaths: options.sourcePaths,
			languageTags: options.languageTags,
			promptGenerators: options.promptGenerators,
			targetStrategy: (language, sourcePath) => {
				const relativePath = path.relative(options.sourceBaseDir, sourcePath)
				return path.join(options.targetDir, language, relativePath)
			},
			cacheGitCwd: options.cacheGitCwd,
			logMessageFn: options.logMessageFn
		},
		translationOptions
	)
	return { cacheCount: result.cacheCount, totalProcessed: result.totalProcessed }
}

/**
 * Generalized function that handles the translation or loading of files for various languages.
 * It checks whether a cached translation is up-to-date before generating a new translation.
 *
 * @param options - An object containing source file paths, language tags, prompt generator, target strategy, and the cache working directory.
 * @param translationOptions - Global translation configuration options
 * @returns A Promise that resolves with the results of the operation
 */
export async function translateOrLoad(
	options: {
		sourcePaths: string[]
		languageTags: string[]
		promptGenerators: PromptGenerator[]
		targetStrategy: TargetStrategy
		cacheGitCwd: string
		logMessageFn?: (msg: string) => void
	},
	translationOptions: TranslationOptions
): Promise<{ cacheCount: number; totalProcessed: number }> {
	const log = options.logMessageFn || console.log
	// Log function ready
	let done = 1
	let total = 0
	let cacheCount = 0

	await Promise.all(
		options.sourcePaths.map(async (sourcePath) => {
			const sourceFileName = path.basename(sourcePath)
			/** Backslash to forward slash to match Git log and for web path */
			const processedSourcePath = path.relative('.', sourcePath).replaceAll(/\\/g, '/')
			await Promise.all(
				options.languageTags.map(async (languageTag) => {
					const target = options.targetStrategy(languageTag, sourcePath)
					let useCachedTranslation = false
					let fileExists = false

					// Check if we can use the cached translation
					if (fsSync.existsSync(target)) {
						fileExists = true
						const sourceLatestCommitDate =
							translationOptions.mainLatestCommitDates.get(processedSourcePath)
						if (!sourceLatestCommitDate) {
							log(
								`Didn't prepare latest commit date for ${processedSourcePath}, use Cached version`
							)
							useCachedTranslation = true
						}
						const cachePathFromCwd = path.relative(options.cacheGitCwd, target)
						const processedCachePathFromCwd = cachePathFromCwd.replaceAll(/\\/g, '/')
						const cacheLatestCommitDate =
							translationOptions.cacheLatestCommitDates.get(processedCachePathFromCwd)
						if (!cacheLatestCommitDate)
							throw new Error(`Didn't prepare latest commit date for ${target}`)
						if (cacheLatestCommitDate > sourceLatestCommitDate) {
							useCachedTranslation = true
							cacheCount++
						}
					}

					// If we can't use cache, generate a new translation
					if (!useCachedTranslation) {
						total++
						const content = await fs.readFile(sourcePath, 'utf-8')
						const processedContent = preprocessMarkdown(content)

						if (translationOptions.verbose) {
							log(processedContent)
						}

						const page = extractWebPath(sourcePath)
						const promptAdditions = '' // Will be handled by the prompt generator

						const translation = await translate(
							processedContent,
							options.promptGenerators,
							languageTag,
							promptAdditions,
							translationOptions,
							sourcePath
						)

						// Only perform actual file writes and Git operations in non-dry run mode
						if (!translationOptions.isDryRun) {
							const processedTranslation = postprocessMarkdown(processedContent, translation)
							await writeFileWithDir(target, processedTranslation)

							const message = getCommitMessage(sourceFileName, languageTag, fileExists)
							try {
								await translationOptions.gitQueue.add(() =>
									(fileExists
										? translationOptions.cacheGit
										: translationOptions.cacheGit.add('.')
									).commit(message, ['-a'])
								)
							} catch (e) {
								if (e instanceof Error && e.message.includes('nothing to commit')) {
									log(`${sourceFileName} in ${languageTag} didn't change`)
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
	const totalProcessed = options.sourcePaths.length * options.languageTags.length
	return { cacheCount, totalProcessed }
}
