/**
 * This file handles the dry run mode functionality for the l10n process.
 * It allows cost estimation and reporting without making actual API calls.
 */

import path from 'path'

/**
 * Model configuration with pricing and estimation parameters
 * Pricing updated June 2025 based on actual usage data
 */
export const MODEL_CONFIGS = {
	'meta-llama/llama-3.1-405b-instruct': {
		// Cost per 1000 words of content (based on actual usage: ~$0.70 for 92.36k words)
		COST_PER_1000_WORDS: 0.0076,
		// Fixed word overhead for prompt instructions
		PROMPT_OVERHEAD_WORDS: 300,
		// Markdown formatting overhead (percentage of content words)
		MARKDOWN_OVERHEAD_PERCENT: 15,
		// L10n quality description
		L10N_QUALITY: 'High-quality for most language pairs; excellent with context'
	}
	// Additional models can be added here as needed
}

// Default to the model specified in llm-client.ts
const DEFAULT_MODEL = 'meta-llama/llama-3.1-405b-instruct'

// Type definitions for statistics collection
export type Stats = {
	l10nsToCapture: number
	totalWordCount: number
	contentWordCount: number
	overheadWordCount: number
	estimatedCost: number
	byLanguage: Record<
		string,
		{
			files: string[]
			wordCount: number
			estimatedCost: number
		}
	>
}

// Initialize statistics object
export const createDryRunStats = (): Stats => ({
	l10nsToCapture: 0,
	totalWordCount: 0,
	contentWordCount: 0,
	overheadWordCount: 0,
	estimatedCost: 0,
	byLanguage: {}
})

/**
 * Count words in a string using regex splitting
 * @param text - The text to count words in
 * @returns The word count
 */
function countWords(text: string): number {
	// Split on any non-word character sequence and filter out empty strings
	return text.split(/\W+/).filter((word) => word.length > 0).length
}

/**
 * Track content that would be localized in dry run mode
 *
 * @param stats - The stats object to update
 * @param content - The content that would be localized
 * @param language - The target language
 * @param filePath - Optional file path for reporting
 * @param modelName - Optional model name to use (defaults to DEFAULT_MODEL)
 */
export function trackL10n(
	stats: Stats,
	content: string,
	language: string,
	filePath?: string,
	modelName: string = DEFAULT_MODEL
): void {
	const contentWordCount = countWords(content)
	const fileName = filePath ? path.basename(filePath) : 'unknown'

	// Get model configuration
	const modelConfig = MODEL_CONFIGS[modelName] || MODEL_CONFIGS[DEFAULT_MODEL]

	// Calculate overhead words
	const promptOverheadWords = modelConfig.PROMPT_OVERHEAD_WORDS
	const markdownOverheadWords = Math.ceil(
		contentWordCount * (modelConfig.MARKDOWN_OVERHEAD_PERCENT / 100)
	)
	const totalOverheadWords = promptOverheadWords + markdownOverheadWords

	// Calculate total words for the l10n task
	// For two-pass l10n: original content + first pass + review
	const firstPassWords = contentWordCount + totalOverheadWords
	const reviewPassWords = contentWordCount + totalOverheadWords + contentWordCount
	const totalWords = firstPassWords + reviewPassWords

	// Calculate cost (in 1000-word units)
	const estimatedCost = (totalWords / 1000) * modelConfig.COST_PER_1000_WORDS

	// Initialize language stats if needed
	if (!stats.byLanguage[language]) {
		stats.byLanguage[language] = {
			files: [],
			wordCount: 0,
			estimatedCost: 0
		}
	}

	// Update statistics
	stats.contentWordCount += contentWordCount
	stats.overheadWordCount += totalOverheadWords
	stats.totalWordCount += totalWords
	stats.estimatedCost += estimatedCost

	stats.byLanguage[language].wordCount += totalWords
	stats.byLanguage[language].estimatedCost += estimatedCost

	if (filePath) {
		stats.l10nsToCapture++
		stats.byLanguage[language].files.push(fileName)
	}
}

/**
 * Print a summary of the dry run statistics
 *
 * @param stats - The statistics object
 * @param verbose - Whether to print detailed information
 * @param cacheCount - Number of cached files (not needing l10n)
 * @param modelName - Optional model name to display (defaults to DEFAULT_MODEL)
 */
export function printDryRunSummary(
	stats: Stats,
	verbose = false,
	cacheCount = 0,
	modelName: string = DEFAULT_MODEL
): void {
	const modelConfig = MODEL_CONFIGS[modelName] || MODEL_CONFIGS[DEFAULT_MODEL]

	console.log('\n=== DRY RUN L10N SUMMARY ===')
	console.log(`Model: ${modelName}`)
	console.log(`L10ns to capture: ${stats.l10nsToCapture}`)
	console.log(`Files using cache: ${cacheCount}`)

	// Word count breakdown
	console.log(`Content word count: ${stats.contentWordCount.toLocaleString()}`)
	console.log(
		`Overhead word count: ${stats.overheadWordCount.toLocaleString()} (prompt instructions and formatting)`
	)
	console.log(`Total word count: ${stats.totalWordCount.toLocaleString()} (includes two-pass l10n)`)

	// Cost in 1000-word units
	const wordUnits = stats.totalWordCount / 1000
	console.log(`L10n workload: ${wordUnits.toFixed(2)} thousand-word units`)
	console.log(`Estimated cost: $${stats.estimatedCost.toFixed(2)}`)

	if (modelConfig.COST_PER_1000_WORDS === 0) {
		console.log(`Note: This model appears to be free to use through current provider`)
	}

	// Print per-language statistics
	console.log('\nBy language:')
	Object.entries(stats.byLanguage).forEach(([lang, langStats]) => {
		const langWordUnits = langStats.wordCount / 1000
		console.log(
			`  ${lang}: ${langStats.files.length} files, ${langWordUnits.toFixed(2)} thousand-word units, $${langStats.estimatedCost.toFixed(2)}`
		)

		if (verbose) {
			console.log('    L10ns to capture:')
			langStats.files.forEach((file) => {
				console.log(`      - ${file}`)
			})
		}
	})

	console.log('\nNote: This is a dry run - no l10ns were captured')
	console.log('===================================\n')
}
