// SVELTEKIT SUBSTITUTE: Removed SvelteKit imports and replaced with Netlify Function structure
// SVELTEKIT SUBSTITUTE: Changed from '@sveltejs/kit' to standard Response objects
// SVELTEKIT SUBSTITUTE: Changed import paths to netlify/functions

import { JobStorage } from './storage'
import { prepareResponse } from './write'

// SVELTEKIT SUBSTITUTE: Converted to Netlify Function handler
export const handler = async (event: any, context: any) => {
	// SVELTEKIT SUBSTITUTE: Handle CORS for browser requests
	const headers = {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
	}

	// Handle preflight requests
	if (event.httpMethod === 'OPTIONS') {
		return {
			statusCode: 200,
			headers,
			body: ''
		}
	}

	// Handle GET requests
	if (event.httpMethod === 'GET') {
		// SVELTEKIT SUBSTITUTE: Parse query parameters from event instead of url.searchParams
		const jobId = event.queryStringParameters?.jobId

		if (!jobId) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: 'Job ID is required' })
			}
		}

		try {
			const jobData = await JobStorage.getJob(jobId)

			if (!jobData) {
				return {
					statusCode: 404,
					headers,
					body: JSON.stringify({ error: 'Job not found' })
				}
			}

			// Prepare response using your existing function
			const response = prepareResponse(jobData.writeState)

			return {
				statusCode: 200,
				headers,
				body: JSON.stringify({
					...response,
					jobId,
					status: jobData.status,
					error: jobData.error,
					createdAt: jobData.createdAt,
					completedAt: jobData.completedAt
				})
			}
		} catch (error) {
			console.error('Error checking job status:', error)
			return {
				statusCode: 500,
				headers,
				body: JSON.stringify({ error: 'Internal server error' })
			}
		}
	}

	// Handle POST requests (for compatibility)
	if (event.httpMethod === 'POST') {
		try {
			const { jobId } = JSON.parse(event.body || '{}')

			if (!jobId) {
				return {
					statusCode: 400,
					headers,
					body: JSON.stringify({ error: 'Job ID is required' })
				}
			}

			const jobData = await JobStorage.getJob(jobId)

			if (!jobData) {
				return {
					statusCode: 404,
					headers,
					body: JSON.stringify({ error: 'Job not found' })
				}
			}

			const response = prepareResponse(jobData.writeState)

			return {
				statusCode: 200,
				headers,
				body: JSON.stringify({
					...response,
					jobId,
					status: jobData.status,
					error: jobData.error
				})
			}
		} catch (error) {
			console.error('Error checking job status:', error)
			return {
				statusCode: 500,
				headers,
				body: JSON.stringify({ error: 'Internal server error' })
			}
		}
	}

	// Handle unsupported methods
	return {
		statusCode: 405,
		headers,
		body: JSON.stringify({ error: 'Method not allowed' })
	}
}
