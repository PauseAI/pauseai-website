/**
 * LLM API client for translation operations
 * Handles communication with language model APIs for translation
 */

import axios from 'axios'
import axiosRetry from 'axios-retry'
import PQueue from 'p-queue'

// Default values for LLM client configuration
export const LLM_DEFAULTS = {
	BASE_URL: 'https://openrouter.ai/api/v1/',
	MODEL: 'meta-llama/llama-3.1-405b-instruct',
	PROVIDERS: ['Fireworks'],
	REQUESTS_PER_SECOND: 1
}

/**
 * Creates a request queue for rate-limiting API calls
 *
 * @param requestsPerSecond - Maximum number of requests per second
 * @returns A PQueue instance for request rate limiting
 */
export function createRequestQueue(
	requestsPerSecond: number = LLM_DEFAULTS.REQUESTS_PER_SECOND
): PQueue {
	return new PQueue({
		intervalCap: requestsPerSecond,
		interval: 1000
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
		Object.assign(config.data, {
			model: options.model,
			provider: {
				order: options.providers
			}
		})
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
	messages: { role: string; content: string }[],
	temperature: number = 0,
	isDryRun: boolean = false
): Promise<string> {
	// In dry run mode, skip the actual API call
	if (isDryRun) {
		return '[DRY RUN API CALL PLACEHOLDER]'
	}

	const response = await queue.add(() =>
		client.post('/chat/completions', { messages, temperature })
	)
	return response.data.choices[0].message.content
}
