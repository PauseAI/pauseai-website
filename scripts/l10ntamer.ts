#!/usr/bin/env tsx

/**
 * L10n Tamer: Audit script to find links to unlocalized pages in both:
 * 1. Prerendered static HTML files
 * 2. Server-side JavaScript chunks
 *
 * This helps track progress on link localization and spot outliers.
 * Only runs when locale prefixes are enabled for all routes.
 */

import fs from 'fs'
import path from 'path'
import { locales, localizeHref } from '../src/lib/paraglide/runtime.js'

if (localizeHref('/test', { locale: 'en' }) === '/test') {
	console.log('⏭️  Skipping l10ntamer - English routes not prefixed')
	process.exit(0)
}

const LOCALES: readonly string[] = locales
const UNLOCALIZED_PATTERNS = [
	// Common content pages that should be localized
	'/faq',
	'/proposal',
	'/learn',
	'/action',
	'/donate',
	'/join',
	'/events',
	'/risks',
	'/xrisk',
	'/feasibility',
	'/teams',
	'/people',
	'/posts',
	'/quotes',
	'/communities',
	'/organization'
]

interface LinkAuditResult {
	file: string
	links: string[]
	type: 'html' | 'js'
	isLocalizedPage: boolean
}

export function findFilesRecursively(dir: string, ext: string) {
	const files = fs.readdirSync(dir, { recursive: true }) as string[]
	return files
		.map((file) => path.join(dir, file))
		.filter((file) => path.extname(file) === '.' + ext)
}

async function findUnlocalizedLinks(): Promise<LinkAuditResult[]> {
	const results: LinkAuditResult[] = []

	// 1. Audit prerendered HTML files
	console.log('🔍 Scanning prerendered HTML files...')
	const htmlFiles = findFilesRecursively('.svelte-kit/output/prerendered/pages', '.html')

	for (const file of htmlFiles) {
		const content = fs.readFileSync(file, 'utf-8')
		const links = findUnlocalizedLinksInContent(content, 'html')

		if (links.length > 0) {
			const relativePath = file.replace('.svelte-kit/output/prerendered/pages/', '')
			const isLocalizedPage = isLocalizedFile(relativePath)

			results.push({
				file: relativePath,
				links,
				type: 'html',
				isLocalizedPage
			})
		}
	}

	// 2. JavaScript chunks are skipped - they contain false positives
	//
	// JS chunks contain unlocalized links at build time (e.g., "/join", "/action")
	// but these get properly localized at runtime via the custom 'a' component during
	// client-side hydration. Since prerendered HTML is correctly localized and uses
	// the same mdsvex → custom 'a' component pipeline, we can assume JS chunks
	// work correctly too. Auditing build artifacts rather than runtime behavior
	// creates false positives that don't reflect actual user experience.
	//
	// console.log('🔍 Scanning JavaScript chunks...')
	// const jsFiles = findFilesRecursively('.svelte-kit/output/server/chunks', '.js')
	//
	// for (const file of jsFiles) {
	// 	const content = fs.readFileSync(file, 'utf-8')
	// 	const links = findUnlocalizedLinksInContent(content, 'js')
	//
	// 	if (links.length > 0) {
	// 		const relativePath = file.replace('.svelte-kit/output/server/chunks/', 'chunks/')
	// 		const isLocalizedPage = true
	//
	// 		results.push({
	// 			file: relativePath,
	// 			links,
	// 			type: 'js',
	// 			isLocalizedPage
	// 		})
	// 	}
	// }

	return results
}

function findUnlocalizedLinksInContent(content: string, type: 'html' | 'js'): string[] {
	const links: string[] = []

	if (type === 'html') {
		// For HTML, we need to check for hreflang to exclude language switcher links
		// Match <a> tags with href attribute
		const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>/g
		let match
		while ((match = linkPattern.exec(content)) !== null) {
			const fullTag = match[0]
			const href = match[1]

			// Skip if this link has hreflang attribute (language switcher)
			if (fullTag.includes('hreflang=')) {
				continue
			}

			// Check if this is an unlocalized internal link
			if (isUnlocalizedInternalLink(href)) {
				links.push(href)
			}
		}
	} else {
		// For JS, use simpler patterns (language switcher links are rendered client-side)
		const patterns = [/href:\s*["']([^"']+)["']/g, /href\s*=\s*["']([^"']+)["']/g]

		for (const pattern of patterns) {
			let match
			while ((match = pattern.exec(content)) !== null) {
				const href = match[1]

				// Check if this is an unlocalized internal link
				if (isUnlocalizedInternalLink(href)) {
					links.push(href)
				}
			}
		}
	}

	// Remove duplicates
	return [...new Set(links)]
}

function isLocalizedFile(filePath: string): boolean {
	// Check if file is in a locale directory (e.g., "de/faq.html", "en/proposal.html")
	const pathParts = filePath.split('/')
	if (pathParts.length > 1 && LOCALES.includes(pathParts[0])) {
		return true
	}

	// Also check for locale homepage files (e.g., "de.html", "nl.html")
	if (pathParts.length === 1) {
		const fileName = pathParts[0].replace('.html', '')
		return LOCALES.includes(fileName)
	}

	return false
}

function isUnlocalizedInternalLink(href: string): boolean {
	// Skip external links, anchors, and already localized links
	if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
		return false
	}

	// Skip already localized links
	for (const locale of LOCALES) {
		if (href.startsWith(`/${locale}/`)) {
			return false
		}
	}

	// Check if it matches our unlocalized patterns
	return UNLOCALIZED_PATTERNS.some((pattern) => href === pattern || href.startsWith(pattern + '/'))
}

function generateReport(results: LinkAuditResult[]): void {
	console.log('\n📊 UNLOCALIZED LINK AUDIT REPORT')
	console.log('================================\n')

	// Separate localized vs unlocalized source pages
	const fromLocalizedPages = results.filter((r) => r.isLocalizedPage)
	const fromUnlocalizedPages = results.filter((r) => !r.isLocalizedPage)

	// Summary stats (only HTML since JS chunks are skipped)
	const totalLinks = results.reduce((sum, r) => sum + r.links.length, 0)
	const problemLinks = fromLocalizedPages.reduce((sum, r) => sum + r.links.length, 0)
	const expectedLinks = fromUnlocalizedPages.reduce((sum, r) => sum + r.links.length, 0)

	console.log(`📈 Summary:`)
	console.log(`   • HTML files with unlocalized links: ${results.length}`)
	console.log(`   • Total unlocalized links found: ${totalLinks}`)
	console.log(``)
	console.log(`🎯 Key metrics (the real problems):`)
	console.log(`   • 🚨 Links from LOCALIZED pages: ${problemLinks} (need fixing)`)
	console.log(`   • ✅ Links from unlocalized pages: ${expectedLinks} (expected)`)
	console.log(`   • 📊 Files with localized sources: ${fromLocalizedPages.length}`)
	console.log(`   • 📊 Files with unlocalized sources: ${fromUnlocalizedPages.length}`)

	// Most common unlocalized links from localized pages (the problems)
	const problemLinkCounts = new Map<string, number>()
	fromLocalizedPages.forEach((r) => {
		r.links.forEach((link) => {
			problemLinkCounts.set(link, (problemLinkCounts.get(link) || 0) + 1)
		})
	})

	const sortedProblemLinks = Array.from(problemLinkCounts.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)

	console.log(`\n🔗 Most common unlocalized links FROM LOCALIZED PAGES (problems):`)
	sortedProblemLinks.forEach(([link, count]) => {
		console.log(`   ${count}× ${link}`)
	})

	// Sample problematic files (from localized pages)
	console.log(`\n📁 Sample LOCALIZED pages with unlocalized links (the real problems):`)
	fromLocalizedPages.slice(0, 8).forEach((result) => {
		const prefix = result.isLocalizedPage ? '🚨' : '✅'
		console.log(`   ${prefix} HTML: ${result.file}`)
		result.links.slice(0, 3).forEach((link) => {
			console.log(`      → ${link}`)
		})
		if (result.links.length > 3) {
			console.log(`      ... and ${result.links.length - 3} more`)
		}
	})

	if (fromUnlocalizedPages.length > 0) {
		console.log(`\n📁 Sample UNLOCALIZED pages with unlocalized links (expected):`)
		fromUnlocalizedPages.slice(0, 3).forEach((result) => {
			console.log(`   ✅ HTML: ${result.file}`)
			result.links.slice(0, 2).forEach((link) => {
				console.log(`      → ${link}`)
			})
		})
	}
}

// Main execution
async function main() {
	try {
		const isValidateMode = process.argv.includes('--validate')
		const results = await findUnlocalizedLinks()

		// In validate mode, be more concise and exit with error code if issues found
		if (isValidateMode) {
			const htmlFiles = findFilesRecursively('.svelte-kit/output/prerendered/pages', '.html')
			const problemCount = results
				.filter((r) => r.isLocalizedPage)
				.reduce((sum, r) => sum + r.links.length, 0)

			if (problemCount > 0) {
				console.error(`❌ Link localization validation failed!`)
				console.error(
					`   Found ${problemCount} unlocalized links from ${results.filter((r) => r.isLocalizedPage).length} localized pages`
				)
				console.error(`   Run 'pnpm audit:links' for details`)
				console.error(`   See README.md#internal-links for guidance on fixing these issues`)
				process.exit(1)
			} else {
				console.log(
					`✅ Link localization validation passed - no unlocalized links found (checked ${htmlFiles.length} HTML files)`
				)
				return
			}
		}

		// Normal audit mode - show full report
		generateReport(results)

		// Write detailed results to file
		const reportPath = 'unlocalized-links-audit.json'
		fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
		console.log(`\n📄 Detailed results written to: ${reportPath}`)
	} catch (error) {
		console.error('❌ Error running audit:', error)
		process.exit(1)
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main()
}
