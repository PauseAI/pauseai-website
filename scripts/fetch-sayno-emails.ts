#!/usr/bin/env node
/**
 * Fetch email metadata from approved Cloudinary sayno images
 *
 * This script uses the Cloudinary Admin API to retrieve metadata
 * (including email addresses from context) for all approved images
 * in the sayno folder, filtered by creation time.
 */

import { config } from 'dotenv'
import { writeFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
config()

const CLOUD_NAME = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyjlw1syg'
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

// Target epoch time (2025-09-30 12:15 BST)
const CUTOFF_EPOCH = 1759230900

interface CloudinaryResource {
	public_id: string
	asset_id: string
	format: string
	version: number
	resource_type: string
	type: string
	created_at: string
	bytes: number
	width: number
	height: number
	folder?: string
	asset_folder?: string
	url: string
	secure_url: string
	tags?: string[]
	context?: {
		custom?: {
			email?: string
			uploaded_at?: string
			[key: string]: string | undefined
		}
	}
	moderation?: Array<{
		kind: string
		status: string
		response?: Record<string, unknown>
	}>
}

interface CloudinaryResponse {
	resources: CloudinaryResource[]
	next_cursor?: string
	rate_limit_allowed: number
	rate_limit_remaining: number
}

interface EmailRecord {
	public_id: string
	email: string | null
	created_at: string
	created_epoch: number
	tags: string[]
	uploaded_at?: string
	asset_id: string
}

async function callCloudinaryAdminAPI(
	endpoint: string,
	params: Record<string, string> = {}
): Promise<CloudinaryResponse> {
	if (!API_KEY || !API_SECRET) {
		throw new Error('Missing Cloudinary credentials in environment')
	}

	// Build URL with query parameters
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

async function fetchAllResources(): Promise<CloudinaryResource[]> {
	const allResources: CloudinaryResource[] = []
	let nextCursor: string | undefined

	console.log('Fetching all resources (will filter locally by folder)...')

	do {
		const params: Record<string, string> = {
			type: 'upload', // Resource type: upload, private, authenticated
			max_results: '500',
			tags: 'true', // Include tags in response
			context: 'true', // Include context metadata in response
			moderations: 'true' // Include moderation status in response
		}

		if (nextCursor) {
			params.next_cursor = nextCursor
		}

		const response = await callCloudinaryAdminAPI('resources/image', params)

		allResources.push(...response.resources)
		nextCursor = response.next_cursor

		console.log(
			`  Fetched ${response.resources.length} resources (total: ${allResources.length}, remaining rate limit: ${response.rate_limit_remaining})`
		)

		// Small delay to avoid rate limiting
		if (nextCursor) {
			await new Promise((resolve) => setTimeout(resolve, 100))
		}
	} while (nextCursor)

	return allResources
}

function extractEmail(resource: CloudinaryResource): string | null {
	// Email can be in context.custom.email
	if (resource.context?.custom?.email) {
		return resource.context.custom.email
	}

	// Email might also be stored directly in context as a key-value pair
	// The API returns context as an object with a 'custom' field
	return null
}

function parseCreatedAt(dateString: string): number {
	// Cloudinary returns ISO 8601 format: "2025-09-29T14:23:45Z"
	return Math.floor(new Date(dateString).getTime() / 1000)
}

async function main() {
	try {
		console.log('Cloudinary Email Metadata Extractor')
		console.log('====================================\n')
		console.log(`Cloud: ${CLOUD_NAME}`)
		console.log(`Cutoff time: ${new Date(CUTOFF_EPOCH * 1000).toISOString()}\n`)

		// Fetch ALL resources, then filter locally
		const allResources = await fetchAllResources()
		console.log(`\nFetched ${allResources.length} total resources from account\n`)

		// Filter to sayno folder only
		// Check both 'folder' and 'asset_folder' fields, and also public_id prefix as fallback
		const saynoResources = allResources.filter(
			(r) => r.asset_folder === 'sayno' || r.folder === 'sayno' || r.public_id.startsWith('sayno/')
		)
		console.log(`Found ${saynoResources.length} images in sayno folder`)

		// Save raw unfiltered sayno resources to cache
		const rawCacheFile = join(process.cwd(), 'sayno-all-raw-cache.json')
		const rawCacheData = {
			generated_at: new Date().toISOString(),
			total_account_resources: allResources.length,
			sayno_folder_count: saynoResources.length,
			resources: saynoResources
		}
		writeFileSync(rawCacheFile, JSON.stringify(rawCacheData, null, 2))
		console.log(`Raw cache saved to: ${rawCacheFile}\n`)

		// Filter to approved moderation status
		const resources = saynoResources.filter((r) => {
			// Check if moderation status is 'approved'
			if (r.moderation && r.moderation.length > 0) {
				return r.moderation.some((m) => m.status === 'approved')
			}
			// If no moderation field, exclude (not moderated yet)
			return false
		})
		console.log(`Found ${resources.length} approved images in sayno folder\n`)

		// Filter by creation time and extract email data
		const emailRecords: EmailRecord[] = resources
			.map((resource) => {
				const createdEpoch = parseCreatedAt(resource.created_at)
				return {
					public_id: resource.public_id,
					email: extractEmail(resource),
					created_at: resource.created_at,
					created_epoch: createdEpoch,
					tags: resource.tags || [],
					uploaded_at: resource.context?.custom?.uploaded_at,
					asset_id: resource.asset_id
				}
			})
			.filter((record) => record.created_epoch <= CUTOFF_EPOCH)

		// Sort by creation time
		emailRecords.sort((a, b) => a.created_epoch - b.created_epoch)

		// Statistics
		const withEmail = emailRecords.filter((r) => r.email).length
		const withoutEmail = emailRecords.length - withEmail
		const approvedCount = emailRecords.filter((r) => r.tags.includes('approved')).length
		const rejectedCount = emailRecords.filter((r) => r.tags.includes('rejected')).length
		const hasEmailTagCount = emailRecords.filter((r) => r.tags.includes('has_email')).length

		console.log('Statistics:')
		console.log(`  Total images (≤ cutoff): ${emailRecords.length}`)
		console.log(`  With email address: ${withEmail}`)
		console.log(`  Without email: ${withoutEmail}`)
		console.log(`  Tagged 'approved': ${approvedCount}`)
		console.log(`  Tagged 'rejected': ${rejectedCount}`)
		console.log(`  Tagged 'has_email': ${hasEmailTagCount}`)
		console.log(`  Email capture rate: ${((withEmail / emailRecords.length) * 100).toFixed(1)}%\n`)

		// Save to cache file
		const cacheFile = join(process.cwd(), 'sayno-emails-cache.json')
		const cacheData = {
			generated_at: new Date().toISOString(),
			cutoff_epoch: CUTOFF_EPOCH,
			cutoff_date: new Date(CUTOFF_EPOCH * 1000).toISOString(),
			total_count: emailRecords.length,
			email_count: withEmail,
			statistics: {
				with_email: withEmail,
				without_email: withoutEmail,
				approved: approvedCount,
				rejected: rejectedCount,
				has_email_tag: hasEmailTagCount
			},
			records: emailRecords
		}

		writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2))
		console.log(`Cache saved to: ${cacheFile}`)

		// Sample output
		console.log('\nSample records (first 3 with email):')
		emailRecords
			.filter((r) => r.email)
			.slice(0, 3)
			.forEach((record) => {
				console.log(`  ${record.public_id}: ${record.email} (tags: ${record.tags.join(', ')})`)
			})
	} catch (error) {
		console.error('Error:', error)
		process.exit(1)
	}
}

main()
