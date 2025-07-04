import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const USAGE_LOG_FILE = 'write-usage.log'

interface UsageLogEntry {
	[requestId: string]: {
		timestamp: string // ISO format for lexical sorting
		stepName: string
		model: string
		orgId?: string
		usage: {
			input_tokens: number
			cache_creation_input_tokens: number
			cache_read_input_tokens: number
			output_tokens: number
			service_tier: string
		}
		rateLimits: {
			input_tokens_remaining: number
			output_tokens_remaining: number
			requests_remaining: number
			input_tokens_limit: number
			output_tokens_limit: number
			requests_limit: number
		}
		durationMs: number
		toolsUsed: boolean
		webSearchCount?: number
	}
}

/**
 * Log API usage information if write-usage.log file exists
 * Uses JSON blob per line format for easy parsing
 */
export function logApiUsage(
	requestId: string,
	stepName: string,
	model: string,
	response: any, // Anthropic API response
	headers: Record<string, string>, // Response headers
	durationMs: number,
	toolsUsed: boolean = false,
	webSearchCount: number = 0
): void {
	// Only log if the log file exists (opt-in)
	if (!existsSync(USAGE_LOG_FILE)) {
		return
	}

	try {
		const logEntry: UsageLogEntry = {
			[requestId]: {
				timestamp: new Date().toISOString(),
				stepName,
				model,
				orgId: headers['anthropic-organization-id'],
				usage: response.usage || {
					input_tokens: 0,
					cache_creation_input_tokens: 0,
					cache_read_input_tokens: 0,
					output_tokens: 0,
					service_tier: 'unknown'
				},
				rateLimits: {
					input_tokens_remaining: parseInt(
						headers['anthropic-ratelimit-input-tokens-remaining'] || '0'
					),
					output_tokens_remaining: parseInt(
						headers['anthropic-ratelimit-output-tokens-remaining'] || '0'
					),
					requests_remaining: parseInt(headers['anthropic-ratelimit-requests-remaining'] || '0'),
					input_tokens_limit: parseInt(headers['anthropic-ratelimit-input-tokens-limit'] || '0'),
					output_tokens_limit: parseInt(headers['anthropic-ratelimit-output-tokens-limit'] || '0'),
					requests_limit: parseInt(headers['anthropic-ratelimit-requests-limit'] || '0')
				},
				durationMs,
				toolsUsed,
				...(webSearchCount > 0 && { webSearchCount })
			}
		}

		// Append JSON blob as single line
		const logLine = JSON.stringify(logEntry) + '\n'
		writeFileSync(USAGE_LOG_FILE, logLine, { flag: 'a' })
	} catch (error) {
		// Silently fail to avoid breaking the API
		console.warn('Failed to log API usage:', error)
	}
}

/**
 * Wrap an Anthropic API promise to optionally add logging with rate limit headers
 * If logging is disabled, returns the original response
 * If logging is enabled, uses .withResponse() to capture headers and logs usage
 */
export function optionallyLogUsage<T>(
	originalPromise: any, // The anthropic.messages.create() promise
	stepName: string,
	model: string,
	startTime: number,
	toolsUsed: boolean = false,
	webSearchCount: number = 0
): Promise<T> {
	// If logging is disabled, return original promise unchanged
	if (!existsSync(USAGE_LOG_FILE)) {
		return originalPromise
	}

	// If logging is enabled, use withResponse() to get headers
	return originalPromise
		.withResponse()
		.then((responseWithMeta: any) => {
			const response = responseWithMeta.data
			const headers = responseWithMeta.response.headers
			const durationMs = Date.now() - startTime

			// Log in background (don't block)
			try {
				const logEntry: UsageLogEntry = {
					[response.id]: {
						timestamp: new Date().toISOString(),
						stepName,
						model,
						usage: response.usage || {
							input_tokens: 0,
							cache_creation_input_tokens: 0,
							cache_read_input_tokens: 0,
							output_tokens: 0,
							service_tier: 'unknown'
						},
						rateLimits: {
							input_tokens_remaining: parseInt(
								headers.get('anthropic-ratelimit-input-tokens-remaining') || '0'
							),
							output_tokens_remaining: parseInt(
								headers.get('anthropic-ratelimit-output-tokens-remaining') || '0'
							),
							requests_remaining: parseInt(
								headers.get('anthropic-ratelimit-requests-remaining') || '0'
							),
							input_tokens_limit: parseInt(
								headers.get('anthropic-ratelimit-input-tokens-limit') || '0'
							),
							output_tokens_limit: parseInt(
								headers.get('anthropic-ratelimit-output-tokens-limit') || '0'
							),
							requests_limit: parseInt(headers.get('anthropic-ratelimit-requests-limit') || '0')
							// Check for potential web search rate limit headers (may not exist)
							/*
							web_search_remaining:
								parseInt(headers.get('anthropic-ratelimit-web-search-remaining') || '0') || null,
							web_search_limit:
								parseInt(headers.get('anthropic-ratelimit-web-search-limit') || '0') || null,
							// Also capture web search usage from response body if available
							web_search_requests_used: response.usage?.server_tool_use?.web_search_requests || null
                            */
						},
						durationMs,
						toolsUsed,
						...(webSearchCount > 0 && { webSearchCount })
					}
				}

				// Append JSON blob as single line
				const logLine = JSON.stringify(logEntry) + '\n'
				writeFileSync(USAGE_LOG_FILE, logLine, { flag: 'a' })
			} catch (error) {
				// Silently fail to avoid breaking the API
				console.warn('Failed to log API usage:', error)
			}

			// Return the original response (not the withResponse wrapper)
			return response
		})
		.catch((error: any) => {
			// Log errors with headers if possible
			const durationMs = Date.now() - startTime

			try {
				const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
				const logEntry = {
					[errorId]: {
						timestamp: new Date().toISOString(),
						stepName,
						model,
						error: error?.message || String(error),
						durationMs,
						toolsUsed,
						// Try to get rate limits from error response if available
						rateLimits: error?.headers
							? {
									input_tokens_remaining: parseInt(
										error.headers['anthropic-ratelimit-input-tokens-remaining'] || '0'
									),
									output_tokens_remaining: parseInt(
										error.headers['anthropic-ratelimit-output-tokens-remaining'] || '0'
									),
									requests_remaining: parseInt(
										error.headers['anthropic-ratelimit-requests-remaining'] || '0'
									),
									input_tokens_limit: parseInt(
										error.headers['anthropic-ratelimit-input-tokens-limit'] || '0'
									),
									output_tokens_limit: parseInt(
										error.headers['anthropic-ratelimit-output-tokens-limit'] || '0'
									),
									requests_limit: parseInt(
										error.headers['anthropic-ratelimit-requests-limit'] || '0'
									)
								}
							: null
					}
				}

				// Append JSON blob as single line
				const logLine = JSON.stringify(logEntry) + '\n'
				writeFileSync(USAGE_LOG_FILE, logLine, { flag: 'a' })
			} catch (logError) {
				// Silently fail to avoid breaking the API
				console.warn('Failed to log API error:', logError)
			}

			// Rethrow the original error
			throw error
		})
}
