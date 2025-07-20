/**
 * LLM API client for l10n operations
 * Handles communication with language model APIs for l10n
 */

import axios, { type AxiosError, isAxiosError, type AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import PQueue from 'p-queue'
import { fetchAndDisplayBilling, formatLlmErrorForLogging } from './llm-utils'

// Default values for LLM client configuration
export const LLM_DEFAULTS = {
	BASE_URL: 'https://openrouter.ai/api/v1/',
	MODEL: 'meta-llama/llama-3.1-405b-instruct',
	PROVIDERS: ['Fireworks'],
	REQUESTS_PER_SECOND: 1
}

type Completion = {
	choices: {
		message: {
			content: string
		}
	}[]
}

type CompletionPayload = {
	messages: Message[]
	temperature: number
	model: string
	provider: {
		order: string[]
	}
}

type CompletionResponse = AxiosResponse<Completion, CompletionPayload>

type Message = {
	role: 'system' | 'user' | 'assistant'
	content: string
}

export type PartialCompletionPayload = Omit<CompletionPayload, 'model' | 'provider'>

type OpenRouterError = {
	error: unknown
}

export type OpenRouterErrorResponse = AxiosError<OpenRouterError>

/**
 * Creates a request queue for rate-limiting API calls
 *
 * @param requestsPerSecond - Maximum number of requests per second
 * @returns A PQueue instance for request rate limiting
 */
export function createRateLimitingQueue(
	requestsPerSecond: number = LLM_DEFAULTS.REQUESTS_PER_SECOND
): PQueue {
	return new PQueue({
		intervalCap: requestsPerSecond,
		interval: 1000
	})
}

/**
 * Creates a queue for controlling the number of simultaneous operations.
 *
 * @param concurrency - The maximum number of concurrent operations allowed. Defaults to 1.
 * @returns A PQueue instance for managing concurrency.
 */
export function createConcurrencyQueue(concurrency: number = 1): PQueue {
	return new PQueue({
		concurrency
	})
}

/**
 * Creates an Axios client configured for the LLM API.
 *
 * @param options - An object containing the API base URL, API key, model, and provider names.
 * @returns An Axios instance with interceptors for retrying failed requests and default headers.
 */
export function createLlmClient(options: {
	baseUrl: string
	apiKey: string
	model: string
	providers: string[]
}) {
	const created = axios.create({
		baseURL: options.baseUrl,
		headers: {
			Authorization: `Bearer ${options.apiKey}`
		}
	})
	created.interceptors.request.use((config) => {
		// Only modify data for requests that have a body (POST, PUT, etc.)
		if (config.data) {
			Object.assign(config.data, {
				model: options.model,
				provider: {
					order: options.providers
				}
			})
		}
		return config
	})
	axiosRetry(created, {
		retryDelay: axiosRetry.exponentialDelay,
		retryCondition: axiosRetry.isRetryableError
	})
	return created
}

/**
 * Sends a chat completion request to the LLM API.
 *
 * @param client - The API client to use for the request
 * @param queue - Request queue for rate limiting
 * @param messages - Array of message objects for the conversation
 * @param temperature - Temperature to use for generation (default is 0)
 * @param isDryRun - Whether to run in dry run mode (simulating API calls)
 * @returns A Promise that resolves to the generated message content
 */
export async function postChatCompletion(
	client: ReturnType<typeof createLlmClient>,
	queue: PQueue,
	messages: Message[],
	temperature = 0,
	isDryRun = false
): Promise<string> {
	// In dry run mode, skip the actual API call
	if (isDryRun) {
		return '[DRY RUN API CALL PLACEHOLDER]'
	}

	const partialCompletionPayload: PartialCompletionPayload = {
		messages,
		temperature
	}

	try {
		const response = await queue.add(
			() =>
				client.post<Completion, CompletionResponse, PartialCompletionPayload>(
					'/chat/completions',
					partialCompletionPayload
				),
			{
				// We don't specify a timeout so this should never happen but it ensures the queue can't return void
				throwOnTimeout: true
			}
		)
		return response.data.choices[0].message.content
	} catch (error) {
		if (!isAxiosError<OpenRouterError>(error)) throw error

		// Extract and log detailed error information
		const errorDetails = formatLlmErrorForLogging(error, partialCompletionPayload)

		console.error('LLM API call failed:')
		console.error(errorDetails)

		// For 402 errors on OpenRouter, try to fetch billing information
		const status = error.response?.status
		const isOpenRouter = client.defaults?.baseURL?.includes('openrouter.ai')

		if (status === 402 && isOpenRouter) {
			await fetchAndDisplayBilling(client)
		}

		// Throw a cleaner error without the full response dump
		const statusText = error.response?.statusText || 'Error'
		throw new Error(`LLM API call failed: ${status} ${statusText}`)
	}
}
