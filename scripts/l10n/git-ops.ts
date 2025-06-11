/**
 * Git operations for translation management
 * Handles repository cloning, commit tracking, and other Git operations
 */

import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git'
import { L10NS_BASE_DIR } from '../../src/lib/l10n'
import { ensureDirectoryExists } from './utils'

/**
 * Configuration for Git operations
 */
export const GIT_CONFIG = {
	EMAIL: 'example@example.com',
	MAX_CONCURRENT_PROCESSES: 8,
	USERNAME: 'Translations'
}

// Translation repository URL (public access)
export const TRANSLATION_REPO_URL = 'github.com/PauseAI/paraglide'

/**
 * Creates a SimpleGit instance with configured options
 *
 * @returns A configured SimpleGit instance
 */
export function createGitClient(): SimpleGit {
	const gitOptions: Partial<SimpleGitOptions> = {
		maxConcurrentProcesses: GIT_CONFIG.MAX_CONCURRENT_PROCESSES
	}
	return simpleGit(gitOptions)
}

/**
 * Initialize or update a translation repository
 * Can be called directly to manage the translation repository
 *
 * @param repoDir Directory where the repository should be
 * @param verbose Whether to log detailed output
 * @returns Success status
 */
export function setupTranslationRepo(repoDir: string, verbose = false): boolean {
	try {
		// Check if the directory exists and is a git repo
		if (fs.existsSync(path.join(repoDir, '.git'))) {
			if (verbose) {
				console.log('  \u2713 Translation repository already exists, pulling latest changes...')
			}

			// Pull latest changes
			execSync(`cd ${repoDir} && git pull`, { stdio: verbose ? 'inherit' : 'ignore' })
			if (verbose) console.log('  \u2713 Updated translation repository')
		} else {
			// Clone the repository
			if (verbose) console.log('  \u2713 Cloning translation repository...')

			// If directory exists but isn't a git repo, remove it
			if (fs.existsSync(repoDir)) {
				fs.rmSync(repoDir, { recursive: true, force: true })
			}

			// Ensure parent directory exists
			ensureDirectoryExists(path.dirname(repoDir), verbose)

			// Clone public repository - no token needed for public repos
			const gitCommand = `git clone https://${TRANSLATION_REPO_URL}.git ${repoDir}`
			execSync(gitCommand, { stdio: verbose ? 'inherit' : 'ignore' })
			if (verbose) console.log('  \u2713 Cloned translation repository')
		}
		return true
	} catch (error) {
		console.error('\n\u274c FAILED TO SET UP TRANSLATION REPOSITORY!')
		console.error(`   Error accessing translation repository: ${(error as Error).message}`)
		console.error('\n   Options:')
		console.error('   1. Continue with English-only: Edit .env to set PARAGLIDE_LOCALES=en')
		console.error('   2. Check your internet connection and try again')
		console.error('   3. Contact the project maintainers if the issue persists')
		return false
	}
}

/**
 * Initializes the Git cache by removing the existing directory,
 * cloning the remote repository, and configuring Git user settings.
 *
 * @param options - An object containing the target directory, authentication token, repository URL, username, and email.
 * @returns A Promise that resolves when the cache repository has been cloned and configured.
 */
export async function initializeGitCache(options: {
	dir: string
	token?: string
	repo: string
	username: string
	email: string
	git: SimpleGit
}): Promise<void> {
	await fsPromises.rm(options.dir, {
		recursive: true,
		force: true
	})

	// Use token if available (CI/CD with write access) or public URL (local dev, read-only)
	const remote = options.token
		? `https://${options.token}@${options.repo}`
		: `https://${options.repo}.git`

	console.log(
		`\ud83d\udd04 Setting up translation repository from ${options.repo} into ${options.dir}`
	)
	console.log(`Using ${options.token ? 'authenticated' : 'unauthenticated'} Git access`)

	// Time the clone operation
	console.time('⏱️ Git Clone')
	await options.git.clone(remote, options.dir)
	console.timeEnd('⏱️ Git Clone')

	await options.git.cwd(options.dir)

	// Test if we're authenticated by checking remote URL format
	try {
		const remoteUrl = await options.git.remote(['get-url', 'origin'])
		const isAuthenticated = remoteUrl.includes('@')
		console.log(`Authentication status: ${isAuthenticated ? 'SUCCESS' : 'FAILURE'}`)
	} catch (err) {
		console.log(`Failed to verify authentication: ${err.message}`)
	}

	// Always set git config in case we need to make local commits
	await options.git.addConfig('user.name', options.username)
	await options.git.addConfig('user.email', options.email)
}

/**
 * Extracts the latest commit dates for each file by parsing the Git log.
 *
 * @param git - The SimpleGit instance used to retrieve the log.
 * @returns A Promise that resolves to a Map where keys are file paths and values are the latest commit dates.
 */
export async function getLatestCommitDates(
	git: SimpleGit,
	repoType: string = 'repo'
): Promise<Map<string, Date>> {
	console.log(`Starting git log retrieval for ${repoType} commit dates...`)
	const latestCommitDatesMap = new Map<string, Date>()

	const timerLabelLog = `⏱️ Git Log Retrieval - ${repoType}`
	console.time(timerLabelLog)
	const log = await git.log({
		'--stat': 4096
	})
	console.timeEnd(timerLabelLog)

	console.log(`Retrieved ${log.all.length} commits for ${repoType} date analysis`)

	const timerLabelParse = `⏱️ Parse Git Log - ${repoType}`
	console.time(timerLabelParse)
	for (const entry of log.all) {
		const files = entry.diff?.files
		if (!files) continue
		for (const file of files) {
			if (!latestCommitDatesMap.has(file.file)) {
				latestCommitDatesMap.set(file.file, new Date(entry.date))
			}
		}
	}
	console.timeEnd(timerLabelParse)

	console.log(`Parsed dates for ${latestCommitDatesMap.size} files in ${repoType}`)
	return latestCommitDatesMap
}

/**
 * Generates an appropriate commit message based on whether the translation file already existed.
 *
 * @param sourceFileName - The name of the source file.
 * @param language - The language code for the translation.
 * @param fileExists - Boolean indicating if the file existed.
 * @returns The commit message.
 */
export function getCommitMessage(
	sourceFileName: string,
	language: string,
	fileExists: boolean
): string {
	return fileExists
		? `Update outdated translation for ${sourceFileName} in ${language}`
		: `Create new translation for ${sourceFileName} in ${language}`
}

export function cleanUpGitSecrets() {
	fs.unlinkSync(path.join(L10NS_BASE_DIR, '.git/config'))
}
