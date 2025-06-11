/**
 * Force mode functionality for l10n
 */

import { readdir } from 'fs/promises'
import { minimatch } from 'minimatch'

/**
 * Display help for force mode usage
 */
export function showForceHelp(): void {
	console.error('🔄 Force mode requires pattern(s)')
	console.error('\nUsage:')
	console.error('  pnpm l10n --force "*"              # Force all files')
	console.error('  pnpm l10n --force en.json          # Force specific file')
	console.error('  pnpm l10n --force "*.md"           # All markdown files')
	console.error('  pnpm l10n --force "2024-*"         # Files starting with "2024-"')
	console.error('  pnpm l10n --force en.json join.md  # Multiple patterns')
	console.error('\nSupported patterns (using minimatch glob syntax):')
	console.error('  - Exact match: en.json, learn.md')
	console.error('  - Wildcards: *.md, 2024-*.md')
	console.error('  - Character classes: 202[34]-*.md')
	console.error('  - Brace expansion: {join,donate,learn}.md')
	console.error('\nPatterns match against:')
	console.error('  - messages/en.json')
	console.error('  - src/posts/*.md')
}

/**
 * Resolves force patterns to actual source files
 * @param patterns - Array of patterns to match against source files
 * @param markdownSource - Path to markdown source directory
 * @returns Array of source file paths that match the patterns
 */
export async function resolve(patterns: string[], markdownSource: string): Promise<string[]> {
	const sourceFiles: string[] = []

	// Add message file
	sourceFiles.push('en.json')

	// Add all markdown files from posts
	try {
		const markdownFiles = await readdir(markdownSource)
		for (const file of markdownFiles) {
			if (file.endsWith('.md')) {
				sourceFiles.push(file)
			}
		}
	} catch (error) {
		console.warn(`⚠️  Could not read markdown source directory: ${markdownSource}`)
	}

	// Match patterns against source files
	const matches = patterns.flatMap((pattern) =>
		sourceFiles.filter((file) => minimatch(file, pattern))
	)
	return [...new Set(matches)]
}
