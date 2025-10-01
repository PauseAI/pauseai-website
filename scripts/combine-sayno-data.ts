#!/usr/bin/env node
/**
 * Combine raw sayno resources with approved list to extract email metadata
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Target epoch time (2025-09-30 12:15 BST)
const CUTOFF_EPOCH = 1759230900

interface CloudinaryResource {
	public_id: string
	asset_id: string
	created_at: string
	tags?: string[]
	context?: {
		custom?: {
			email?: string
			uploaded_at?: string
			[key: string]: string | undefined
		}
	}
	[key: string]: unknown
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

function extractEmail(resource: CloudinaryResource): string | null {
	if (resource.context?.custom?.email) {
		return resource.context.custom.email
	}
	return null
}

function parseCreatedAt(dateString: string): number {
	return Math.floor(new Date(dateString).getTime() / 1000)
}

function main() {
	console.log('Combining Sayno Data')
	console.log('====================\n')

	// Load caches
	const rawCache = JSON.parse(
		readFileSync(join(process.cwd(), 'sayno-all-raw-cache.json'), 'utf-8')
	)
	const approvedCache = JSON.parse(
		readFileSync(join(process.cwd(), 'sayno-approved-cache.json'), 'utf-8')
	)

	console.log(`Raw sayno resources: ${rawCache.sayno_folder_count}`)
	console.log(`Approved resources (all): ${approvedCache.total_approved}`)

	// Create set of approved public_ids for fast lookup
	const approvedIds = new Set(
		approvedCache.resources.map((r: { public_id: string }) => r.public_id)
	)

	// Filter raw resources to only approved ones
	const approvedSaynoResources = rawCache.resources.filter((r: CloudinaryResource) =>
		approvedIds.has(r.public_id)
	)

	console.log(`Approved sayno resources: ${approvedSaynoResources.length}`)

	// Filter by creation time and extract email data
	const emailRecords: EmailRecord[] = approvedSaynoResources
		.map((resource: CloudinaryResource) => {
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
		.filter((record: EmailRecord) => record.created_epoch <= CUTOFF_EPOCH)

	// Sort by creation time
	emailRecords.sort((a, b) => a.created_epoch - b.created_epoch)

	// Statistics
	const withEmail = emailRecords.filter((r) => r.email).length
	const withoutEmail = emailRecords.length - withEmail
	const hasEmailTagCount = emailRecords.filter((r) => r.tags.includes('has_email')).length

	console.log(`\nFiltered to cutoff (${new Date(CUTOFF_EPOCH * 1000).toISOString()}):`)
	console.log(`  Total images: ${emailRecords.length}`)
	console.log(`  With email: ${withEmail}`)
	console.log(`  Without email: ${withoutEmail}`)
	console.log(`  Tagged 'has_email': ${hasEmailTagCount}`)
	console.log(`  Email capture rate: ${((withEmail / emailRecords.length) * 100).toFixed(1)}%`)

	// Save final cache
	const cacheFile = join(process.cwd(), 'sayno-emails-cache.json')
	const cacheData = {
		generated_at: new Date().toISOString(),
		cutoff_epoch: CUTOFF_EPOCH,
		cutoff_date: new Date(CUTOFF_EPOCH * 1000).toISOString(),
		total_approved_sayno: approvedSaynoResources.length,
		total_count: emailRecords.length,
		email_count: withEmail,
		statistics: {
			with_email: withEmail,
			without_email: withoutEmail,
			has_email_tag: hasEmailTagCount
		},
		records: emailRecords
	}

	writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2))
	console.log(`\nFinal cache saved to: ${cacheFile}`)

	// Sample output
	console.log('\nSample records (first 3 with email):')
	emailRecords
		.filter((r) => r.email)
		.slice(0, 3)
		.forEach((record) => {
			console.log(`  ${record.public_id}: ${record.email}`)
		})
}

main()
