#!/usr/bin/env node
/**
 * Analyze email similarity to find potentially related addresses
 */

import { readFileSync } from 'fs'
import { join } from 'path'

interface EmailRecord {
	email: string
	public_id: string
}

function levenshteinDistance(str1: string, str2: string): number {
	const len1 = str1.length
	const len2 = str2.length
	const matrix: number[][] = []

	for (let i = 0; i <= len1; i++) {
		matrix[i] = [i]
	}

	for (let j = 0; j <= len2; j++) {
		matrix[0][j] = j
	}

	for (let i = 1; i <= len1; i++) {
		for (let j = 1; j <= len2; j++) {
			const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1, // deletion
				matrix[i][j - 1] + 1, // insertion
				matrix[i - 1][j - 1] + cost // substitution
			)
		}
	}

	return matrix[len1][len2]
}

function main() {
	const cache = JSON.parse(readFileSync(join(process.cwd(), 'sayno-emails-cache.json'), 'utf-8'))

	const emails: EmailRecord[] = cache.records
		.filter((r: { email: string | null }) => r.email)
		.map((r: { email: string; public_id: string }) => ({
			email: r.email.toLowerCase(),
			public_id: r.public_id
		}))

	console.log(`Total emails: ${emails.length}`)
	console.log(`Unique emails: ${new Set(emails.map((e) => e.email)).size}\n`)

	// Find similar email pairs (Levenshtein distance <= 3)
	const similarPairs: Array<{ email1: string; email2: string; distance: number }> = []

	for (let i = 0; i < emails.length; i++) {
		for (let j = i + 1; j < emails.length; j++) {
			const dist = levenshteinDistance(emails[i].email, emails[j].email)
			if (dist <= 3 && dist > 0) {
				similarPairs.push({
					email1: emails[i].email,
					email2: emails[j].email,
					distance: dist
				})
			}
		}
	}

	if (similarPairs.length > 0) {
		console.log(`Found ${similarPairs.length} similar email pairs:\n`)
		similarPairs.sort((a, b) => a.distance - b.distance)
		similarPairs.forEach((pair) => {
			console.log(`  Distance ${pair.distance}: ${pair.email1} <-> ${pair.email2}`)
		})
	} else {
		console.log('No similar emails found (Levenshtein distance <= 3)')
	}

	// Check for suspicious patterns
	console.log('\n--- Potential test/throwaway patterns ---')
	const suspicious = emails.filter(
		(e) =>
			/test|fake|dummy|temp|throw|spam/i.test(e.email) ||
			/\d{5,}/.test(e.email) || // 5+ consecutive digits
			/^[a-z]\d+@/.test(e.email) // single letter followed by numbers
	)

	if (suspicious.length > 0) {
		console.log(`Found ${suspicious.length} potentially suspicious emails:`)
		suspicious.forEach((e) => console.log(`  ${e.email}`))
	} else {
		console.log('No suspicious patterns detected')
	}

	// Domain analysis
	console.log('\n--- Domain distribution ---')
	const domains = new Map<string, number>()
	emails.forEach((e) => {
		const domain = e.email.split('@')[1]
		domains.set(domain, (domains.get(domain) || 0) + 1)
	})

	const sortedDomains = Array.from(domains.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)

	sortedDomains.forEach(([domain, count]) => {
		console.log(`  ${domain}: ${count}`)
	})
}

main()
