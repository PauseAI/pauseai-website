/**
 * Cost estimation helpers for the work-plan dry-run path.
 */

type ModelConfig = {
	COST_PER_1000_WORDS: number
	PROMPT_OVERHEAD_WORDS: number
	MARKDOWN_OVERHEAD_PERCENT: number
	L10N_QUALITY: string
}

type ModelName = (typeof MODELS)[keyof typeof MODELS]

const MODELS = {
	LLAMA_3_3: 'meta-llama/llama-3.3-70b-instruct'
}

/**
 * Model configuration with pricing and estimation parameters.
 * COST_PER_1000_WORDS is empirical for the :nitro routing we actually use,
 * not an OpenRouter list price (the :nitro provider mix is more expensive).
 * Recalibrate when n grows or model changes.
 */
const MODEL_CONFIGS: Record<ModelName, ModelConfig> = {
	[MODELS.LLAMA_3_3]: {
		// Empirical :nitro rate: ~$0.41 actual for $0.0954 estimated, n=1
		// (l10n-es build 2026-04-07, 58 successful items, ratio 4.31x).
		// Bumped from 0.0004 (theoretical list-price calculation).
		COST_PER_1000_WORDS: 0.0017,
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
const DEFAULT_MODEL = MODELS.LLAMA_3_3

/**
 * Count words in a string using regex splitting
 */
export function countWords(text: string): number {
	return text.split(/\W+/).filter((word) => word.length > 0).length
}

/**
 * Estimate the cost of translating content with a given word count.
 * Accounts for two-pass l10n (first pass + review) and prompt overhead.
 */
export function estimateItemCost(
	contentWordCount: number,
	modelName: string = DEFAULT_MODEL
): { estimatedCost: number; overheadWords: number; totalWords: number } {
	const modelConfig = MODEL_CONFIGS[modelName] || MODEL_CONFIGS[DEFAULT_MODEL]

	const promptOverheadWords = modelConfig.PROMPT_OVERHEAD_WORDS
	const markdownOverheadWords = Math.ceil(
		contentWordCount * (modelConfig.MARKDOWN_OVERHEAD_PERCENT / 100)
	)
	const overheadWords = promptOverheadWords + markdownOverheadWords

	// Two-pass: first pass + review pass
	const firstPassWords = contentWordCount + overheadWords
	const reviewPassWords = contentWordCount + overheadWords + contentWordCount
	const totalWords = firstPassWords + reviewPassWords

	const estimatedCost = (totalWords / 1000) * modelConfig.COST_PER_1000_WORDS

	return { estimatedCost, overheadWords, totalWords }
}
