/**
 * Utility functions for translation operations
 */

import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import removeMarkdown from 'remove-markdown'
import GithubSlugger from 'github-slugger'

// Regular expression patterns for file path extraction
export const PATH_PATTERNS = [/src\/posts(\/.*)\.md/, /messages\/(.*)/]

// Markdown processing configuration
export const MARKDOWN_CONFIG = {
	POSTPROCESSING_ADD_HEADING_IDS: true,
	PREPROCESSING_REMOVE_COMMENTS_WITH_MD_HEADINGS: true,
	PREPROCESSING_REMOVE_COMMENTS_WITH_MD_LINKS: true
}

// Comment patterns to preserve in markdown
export type PatternCommentPair = { pattern: RegExp; comment: string }
export const PREPROCESSING_COMMENT_AFTER_PATTERN: PatternCommentPair[] = [
	{
		pattern: /---[\S\s]*?\n---\n/,
		comment: `end of frontmatter metadata, dashes above need to stay`
	},
	{
		pattern: /\]\(#[a-z0-9-_.]+\)/g,
		comment: `don't translate target, only label`
	}
]

/**
 * Helper function to create directory if it doesn't exist and log the result
 * @param dir Directory path to create
 * @param verbose Whether to log the result
 */
export function ensureDirectoryExists(dir: string, verbose = false): void {
	if (!fsSync.existsSync(dir)) {
		fsSync.mkdirSync(dir, { recursive: true })
		if (verbose) console.log(`  \u2713 Created ${dir}`)
	} else if (verbose) {
		console.log(`  \u2713 ${dir} already exists`)
	}
}

/**
 * Ensure a set of directories exist
 * @param dirs Array of directory paths to ensure exist
 * @param verbose Whether to log the results
 */
export function ensureDirectoriesExist(dirs: string[], verbose = false): void {
	for (const dir of dirs) {
		ensureDirectoryExists(dir, verbose)
	}
}

// Create a fresh instance of path.join that normalizes paths consistently
const joinPath = (...parts: string[]) => path.normalize(path.join(...parts))

/**
 * Remove a file or directory if it exists, with logging
 * @param path Path to remove
 * @param description Optional description for the log
 * @param verbose Whether to log the removal
 */
export function removeIfExists(path: string, description?: string, verbose = true): void {
	if (fsSync.existsSync(path)) {
		path = joinPath(path)
		const desc = description || path
		if (verbose) console.log(`Removing ${desc}...`)
		fsSync.rmSync(path, { recursive: true, force: true })
	}
}

/**
 * Remove multiple files or directories if they exist
 * @param paths Array of paths to remove
 * @param description Optional description prefix for the log
 * @param verbose Whether to log the removals
 */
export function removeMultiple(paths: string[], description?: string, verbose = true): void {
	paths.forEach((path) =>
		removeIfExists(path, description ? `${description}: ${path}` : path, verbose)
	)
}

/**
 * Create a symbolic link or log if it already exists
 * @param targetPath The file being linked to
 * @param linkPath The link path to create
 * @param verbose Whether to log the result
 */
export function createSymlinkIfNeeded(targetPath: string, linkPath: string, verbose = false): void {
	// Make sure the directory exists
	ensureDirectoryExists(path.dirname(linkPath), false)

	// Remove existing file or link if it exists
	if (fsSync.lstatSync(linkPath, { throwIfNoEntry: false })) {
		fsSync.unlinkSync(linkPath)
	}

	// Create symbolic link
	fsSync.symlinkSync(path.relative(path.dirname(linkPath), targetPath), linkPath, 'junction')
	if (verbose) console.log(`  \u2713 Linked ${linkPath} to ${targetPath}`)
}

/**
 * Retrieves the value of an environment variable.
 *
 * @param variable - The name of the environment variable.
 * @param dryRunFallback - Optional fallback value to return in dry run mode
 * @param isDryRun - Whether the system is running in dry run mode
 * @param verbose - Whether to output verbose messages
 * @returns The value of the specified environment variable, or a fallback placeholder in dry run mode.
 * @throws {Error} If the environment variable is not set and not in dry run mode.
 */
export function requireEnvVar(
	variable: string,
	dryRunFallback = 'dry-run-placeholder',
	isDryRun = false,
	verbose = false
): string {
	const value = process.env[variable]

	// In dry run mode, return a placeholder if the variable is missing
	if (!value) {
		if (isDryRun) {
			if (verbose) {
				console.log(
					`⚠️ Environment variable ${variable} is missing but not required in dry run mode`
				)
			}
			return dryRunFallback
		}
		throw new Error(`Environment variable ${variable} is required`)
	}

	return value
}

/**
 * Preprocesses markdown content by normalizing line endings,
 * optionally removing HTML comments that contain markdown headings or links,
 * and appending additional inline comments after matching specific patterns.
 *
 * @param source - The original markdown content.
 * @returns The preprocessed markdown content.
 */
export function preprocessMarkdown(source: string): string {
	let processed = source
	processed = processed.replaceAll(/\r\n/g, '\n')
	if (
		MARKDOWN_CONFIG.PREPROCESSING_REMOVE_COMMENTS_WITH_MD_HEADINGS ||
		MARKDOWN_CONFIG.PREPROCESSING_REMOVE_COMMENTS_WITH_MD_LINKS
	) {
		processed = processed.replaceAll(/<!--([\S\s]*?)-->/g, (_0, _1: string) => {
			if (MARKDOWN_CONFIG.PREPROCESSING_REMOVE_COMMENTS_WITH_MD_HEADINGS && _1.match(/# /g))
				return ''
			if (MARKDOWN_CONFIG.PREPROCESSING_REMOVE_COMMENTS_WITH_MD_LINKS && _1.match(/\]\(/g))
				return ''
			return _0
		})
	}
	for (const { pattern, comment } of PREPROCESSING_COMMENT_AFTER_PATTERN) {
		processed = processed.replace(pattern, `$& <!-- ${comment} -->`)
	}
	return processed
}

/**
 * Postprocesses translated markdown content by optionally adding heading IDs.
 * It compares the headings in the source and the translated content and appends a generated ID to each heading.
 *
 * @param source - The original markdown content.
 * @param translation - The translated markdown content before postprocessing.
 * @returns The postprocessed markdown content with heading IDs.
 * @throws {Error} If the number of headings in the translation does not match those in the source.
 */
export function postprocessMarkdown(source: string, translation: string): string {
	const slugger = new GithubSlugger()
	let processed = translation

	if (MARKDOWN_CONFIG.POSTPROCESSING_ADD_HEADING_IDS) {
		const REGEX_HEADING = /^#+ (.*)/gm
		const headingsInSource = Array.from(source.matchAll(REGEX_HEADING))
		if (headingsInSource.length > 0) {
			let i = 0
			processed = translation.replace(REGEX_HEADING, (_match) => {
				const sourceResult = headingsInSource[i]
				if (!sourceResult)
					throw new Error(`Different heading count in translation:\n\n${translation}`)
				const headingInSource = sourceResult[1]
				const stripped = removeMarkdown(headingInSource)
				const slugged = slugger.slug(stripped)
				i++
				return `${_match} {#${slugged}}`
			})
		}
	}
	return processed
}

/**
 * Extracts a web path from a local file path using predefined regex patterns.
 * Returns the extracted portion if found, otherwise returns the original local path.
 *
 * @param localPath - The local file path.
 * @returns The extracted web path or the original file path.
 */
export function extractWebPath(localPath: string): string {
	for (const pattern of PATH_PATTERNS) {
		const result = pattern.exec(localPath)
		// return group
		if (result) return result[1]
	}
	return localPath
}

/**
 * Utility function to create directories and write files atomically
 *
 * @param filePath - Target file path
 * @param content - Content to write to the file
 */
export async function writeFileWithDir(filePath: string, content: string): Promise<void> {
	const dir = path.dirname(filePath)
	await fs.mkdir(dir, { recursive: true })
	fsSync.writeFileSync(filePath, content)
}

/**
 * Cleans up potential LLM commentary in translation JSON files
 * Strips anything before the first '{' and after the last '}'
 *
 * @param filePath - Path to the JSON file to clean
 * @param verbose - Whether to output verbose logs
 */
export function cullCommentary(filePath: string, verbose = false): boolean {
	try {
		const content = fsSync.readFileSync(filePath, 'utf-8')
		const firstBrace = content.indexOf('{')
		const lastBrace = content.lastIndexOf('}')

		if (firstBrace === -1 || lastBrace === -1) throw new Error('No JSON object found in file')

		const jsonContent = content.substring(firstBrace, lastBrace + 1)
		JSON.parse(jsonContent) // checks validity
		if (jsonContent === content) return
		fsSync.writeFileSync(filePath, jsonContent, 'utf-8')

		if (verbose) console.log(`✅ Culled LLM commentary in ${filePath}`)
	} catch (error) {
		console.error(`Error cleaning up file ${filePath}:`, error.message)
	}
}
