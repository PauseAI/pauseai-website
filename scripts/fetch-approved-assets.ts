#!/usr/bin/env node
/**
 * Fetch list of approved asset IDs from Cloudinary moderation API
 */

import { config } from 'dotenv'
import { writeFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
config()

const CLOUD_NAME = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyjlw1syg'
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

interface ModerationResource {
	public_id: string
	moderation_status?: string
	moderation_kind?: string
	[key: string]: unknown
}

interface ModerationResponse {
	resources: ModerationResource[]
	next_cursor?: string
	rate_limit_allowed?: number
	rate_limit_remaining?: number
}

async function callCloudinaryAdminAPI(
	endpoint: string,
	params: Record<string, string> = {}
): Promise<ModerationResponse> {
	if (!API_KEY || !API_SECRET) {
		throw new Error('Missing Cloudinary credentials in environment')
	}

	const url = new URL(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}`)
	Object.entries(params).forEach(([key, value]) => {
		url.searchParams.append(key, value)
	})

	const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')
	const response = await fetch(url.toString(), {
		headers: { Authorization: `Basic ${auth}` }
	})

	if (!response.ok) {
		const text = await response.text()
		throw new Error(`API call failed (${response.status}): ${text}`)
	}

	return response.json()
}

async function fetchApprovedResources(): Promise<ModerationResource[]> {
	const allResources: ModerationResource[] = []
	let nextCursor: string | undefined

	console.log('Fetching approved resources via moderation endpoint...')

	// Try different possible endpoints
	const endpoints = [
		'resources/image/moderations/manual/approved',
		'resources/image/moderations/approved',
		'resources/moderations/approved'
	]

	for (const endpoint of endpoints) {
		try {
			console.log(`Trying endpoint: ${endpoint}`)
			do {
				const params: Record<string, string> = {
					max_results: '500'
				}

				if (nextCursor) {
					params.next_cursor = nextCursor
				}

				const response = await callCloudinaryAdminAPI(endpoint, params)

				allResources.push(...response.resources)
				nextCursor = response.next_cursor

				console.log(
					`  Fetched ${response.resources.length} resources (total: ${allResources.length})`
				)

				if (nextCursor) {
					await new Promise((resolve) => setTimeout(resolve, 100))
				}
			} while (nextCursor)

			// If we got here, endpoint worked
			console.log(`✓ Success with endpoint: ${endpoint}\n`)
			return allResources
		} catch (error) {
			console.log(`✗ Failed with endpoint: ${endpoint}`)
			console.log(`  Error: ${error}\n`)
			// Reset for next attempt
			allResources.length = 0
			nextCursor = undefined
		}
	}

	throw new Error('All moderation endpoints failed')
}

async function main() {
	try {
		console.log('Cloudinary Approved Assets Fetcher')
		console.log('===================================\n')
		console.log(`Cloud: ${CLOUD_NAME}\n`)

		const approvedResources = await fetchApprovedResources()

		console.log(`Total approved resources: ${approvedResources.length}`)

		// Save to cache
		const cacheFile = join(process.cwd(), 'sayno-approved-cache.json')
		const cacheData = {
			generated_at: new Date().toISOString(),
			total_approved: approvedResources.length,
			resources: approvedResources
		}

		writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2))
		console.log(`\nApproved assets cache saved to: ${cacheFile}`)

		// Show sample
		if (approvedResources.length > 0) {
			console.log('\nSample approved assets (first 3):')
			approvedResources.slice(0, 3).forEach((r) => {
				console.log(`  ${r.public_id}`)
			})
		}
	} catch (error) {
		console.error('Error:', error)
		process.exit(1)
	}
}

main()
