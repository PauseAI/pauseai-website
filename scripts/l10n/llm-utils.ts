/**
 * LLM utilities including error handling and billing information
 * Provides utilities for LLM API interactions, error analysis, and account management
 */

import axios from 'axios'

/**
 * Extracted error information from LLM API responses
 */
export interface LlmErrorInfo {
	status?: number
	statusText?: string
	provider?: string

	// OpenRouter-specific error details
	authMessage?: string
	authReason?: string
	authStatus?: string
	rateLimitRemaining?: string
	rateLimitReset?: string
	retryAfter?: string
	errorDetails?: any

	// Request context
	model?: string
	requestProvider?: string
	url?: string

	// Full response for non-OpenRouter errors
	fullResponse?: any
}

/**
 * Extracts useful error information from an LLM API error response
 *
 * @param error - The error object from the LLM API call
 * @param requestData - The original request data for context
 * @returns Structured error information for logging
 */
export function extractLlmErrorInfo(error: any, requestData?: any): LlmErrorInfo {
	const response = error.response
	const config = error.config

	// Determine if this is an OpenRouter error
	const isOpenRouter =
		config?.baseURL?.includes('openrouter.ai') || config?.url?.includes('openrouter.ai')

	const errorInfo: LlmErrorInfo = {
		status: response?.status,
		statusText: response?.statusText,
		provider: isOpenRouter ? 'OpenRouter' : 'Unknown',
		url: config?.url
	}

	if (isOpenRouter) {
		// Extract OpenRouter-specific information
		const headers = response?.headers || {}

		errorInfo.authMessage = headers['x-clerk-auth-message']
		errorInfo.authReason = headers['x-clerk-auth-reason']
		errorInfo.authStatus = headers['x-clerk-auth-status']
		errorInfo.rateLimitRemaining = headers['x-ratelimit-remaining']
		errorInfo.rateLimitReset = headers['x-ratelimit-reset']
		errorInfo.retryAfter = headers['retry-after']
		errorInfo.errorDetails = response?.data?.error

		// Extract request context
		if (requestData) {
			errorInfo.model = requestData.model
			errorInfo.requestProvider = requestData.provider?.order?.[0]
		} else if (config?.data) {
			// Try to parse request data from config
			try {
				const parsedData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
				errorInfo.model = parsedData.model
				errorInfo.requestProvider = parsedData.provider?.order?.[0]
			} catch {
				// Ignore parsing errors
			}
		}
	} else {
		// For non-OpenRouter providers, include the full response for debugging
		errorInfo.fullResponse = {
			status: response?.status,
			statusText: response?.statusText,
			headers: response?.headers,
			data: response?.data,
			config: {
				method: config?.method,
				url: config?.url,
				baseURL: config?.baseURL
			}
		}
	}

	return errorInfo
}

/**
 * Formats LLM error information for logging
 *
 * @param errorInfo - The extracted error information
 * @returns A formatted string suitable for console logging
 */
export function formatLlmError(errorInfo: LlmErrorInfo): string {
	const parts: string[] = []

	// Basic error info
	parts.push(`${errorInfo.provider} Error: ${errorInfo.status} ${errorInfo.statusText}`)

	if (errorInfo.provider === 'OpenRouter') {
		// OpenRouter-specific formatting
		if (errorInfo.authMessage || errorInfo.authReason) {
			parts.push(`Auth Issue: ${errorInfo.authReason} - ${errorInfo.authMessage}`)
		}

		if (errorInfo.rateLimitRemaining || errorInfo.retryAfter) {
			parts.push(
				`Rate Limit: ${errorInfo.rateLimitRemaining} remaining, retry after ${errorInfo.retryAfter}`
			)
		}

		if (errorInfo.model || errorInfo.requestProvider) {
			parts.push(`Request: ${errorInfo.model} via ${errorInfo.requestProvider}`)
		}

		if (errorInfo.errorDetails) {
			parts.push(`Details: ${JSON.stringify(errorInfo.errorDetails)}`)
		}
	} else {
		// Non-OpenRouter: include full response
		parts.push(`Full Response: ${JSON.stringify(errorInfo.fullResponse, null, 2)}`)
	}

	return parts.join('\n  ')
}

/**
 * Convenience function to extract and format LLM error for immediate logging
 *
 * @param error - The error object from the LLM API call
 * @param requestData - The original request data for context
 * @returns A formatted error string ready for logging
 */
export function formatLlmErrorForLogging(error: any, requestData?: any): string {
	const errorInfo = extractLlmErrorInfo(error, requestData)
	return formatLlmError(errorInfo)
}

/**
 * Fetches and displays billing information for OpenRouter API key
 *
 * @param client - Axios client configured for the LLM API
 * @returns Promise that resolves when billing info is logged
 */
export async function fetchAndDisplayBilling(client: any): Promise<void> {
	try {
		// Fetch both key info and credits
		const [keyResponse, creditsResponse] = await Promise.all([
			client.get('/auth/key').catch(() => null),
			client.get('/credits').catch(() => null)
		])

		console.error('\nOpenRouter Account Status:')

		// Display credits information if available
		if (creditsResponse?.data) {
			const credits = creditsResponse.data
			const balance = (credits.total_credits || 0) - (credits.total_usage || 0)
			console.error(`  Balance: $${balance.toFixed(2)}`)
			console.error(`  Total Credits: $${credits.total_credits || 0}`)
			console.error(`  Total Usage: $${credits.total_usage || 0}`)
		}

		// Display key information if available
		if (keyResponse?.data?.data) {
			const keyInfo = keyResponse.data.data
			console.error(`  Spend Limit: $${keyInfo.limit || 'Unknown'}`)
			console.error(`  Limit Remaining: $${keyInfo.limit_remaining || 'Unknown'}`)
			if (keyInfo.rate_limit) {
				console.error(
					`  Rate Limit: ${keyInfo.rate_limit.requests} requests per ${keyInfo.rate_limit.interval}`
				)
			}
		}
	} catch (billingError) {
		console.error('Could not fetch billing information:', billingError.message)
	}
}
