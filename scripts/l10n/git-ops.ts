/**
 * Git operations for l10n management
 * Handles l10n cage operations, commit tracking, and other Git operations
 */

import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git'
import { L10N_CAGE_DIR } from '../../src/lib/l10n'
import { ensureDirectoryExists } from './utils'
import { l10nCageBranch, validateBranchForWrite, setupBranchAndTracking } from './branch-safety'

/**
 * Configuration for Git operations
 */
export const GIT_CONFIG = {
	EMAIL: 'example@example.com',
	MAX_CONCURRENT_PROCESSES: 1,
	USERNAME: 'L10nKeeper'
}

/**
 * Get the l10n cage repository URL with appropriate authentication
 * @returns Git URL with token authentication if GITHUB_TOKEN is available, otherwise SSH
 */
export function cageUrl(): string {
	const repoPath = 'github.com/PauseAI/paraglide'
	return process.env.GITHUB_TOKEN
		? `https://${process.env.GITHUB_TOKEN}@${repoPath}.git`
		: `git@${repoPath.replace('github.com/', 'github.com:')}.git`
}

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
 * Initialize or update the l10n cage repository
 * Can be called directly to manage the l10n cage
 *
 * @param cageDir Directory where the l10n cage should be
 * @param verbose Whether to log detailed output
 * @param branch Optional branch to use (defaults to dynamic detection)
 * @returns Success status
 */
export function setupL10nCage(cageDir: string, verbose = false, branch?: string): boolean {
	try {
		// Use provided branch or detect it
		const targetBranch = branch || l10nCageBranch()

		// Log the branch being used
		if (verbose) {
			console.log(`  ℹ️  Using l10n branch: ${targetBranch}`)
		}

		// Check if the directory exists and is a git repo
		if (fs.existsSync(path.join(cageDir, '.git'))) {
			if (verbose) {
				console.log('  ✓ L10n cage already exists, pulling latest changes...')
			}

			// Pull latest changes (if upstream exists)
			try {
				// Check if current branch has upstream tracking
				const hasUpstream =
					execSync(
						`cd ${cageDir} && git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "none"`,
						{ encoding: 'utf8' }
					).trim() !== 'none'

				if (hasUpstream) {
					execSync(`cd ${cageDir} && git pull`, { stdio: verbose ? 'inherit' : 'ignore' })
					if (verbose) console.log('  ✓ Updated l10n cage')
				} else {
					if (verbose) {
						console.log('  ℹ️  Branch has no upstream yet (this is normal for new branches)')
						console.log('     The upstream will be set automatically on first push')
					}
				}
			} catch (e) {
				if (verbose) console.log('  ⚠️  Could not pull latest changes: ' + (e as Error).message)
			}
		} else {
			// Clone the l10n cage
			if (verbose) console.log('  ✓ Cloning l10n cage repository...')

			// If directory exists but isn't a git repo, remove it
			if (fs.existsSync(cageDir)) {
				fs.rmSync(cageDir, { recursive: true, force: true })
			}

			// Ensure parent directory exists
			ensureDirectoryExists(path.dirname(cageDir), verbose)

			// Clone with appropriate authentication
			const gitCommand = `git clone ${cageUrl()} ${cageDir}`
			execSync(gitCommand, { stdio: verbose ? 'inherit' : 'ignore' })
			if (verbose) {
				const authMethod = process.env.GITHUB_TOKEN ? 'token authentication' : 'SSH'
				console.log(`  ✓ Cloned l10n cage repository using ${authMethod}`)
			}
		}

		// Always ensure we're on the correct branch and configure authentication
		setupBranchAndTracking(cageDir, targetBranch, verbose)
		return true
	} catch (error) {
		console.error('\n❌ FAILED TO SET UP L10N CAGE!')
		console.error(`   Error accessing l10n cage: ${(error as Error).message}`)
		console.error('\n   Options:')
		console.error('   1. Continue with English-only: Edit .env to set PARAGLIDE_LOCALES=en')
		console.error('   2. Check your internet connection and try again')
		console.error('   3. Contact the project maintainers if the issue persists')
		return false
	}
}

/**
 * Initializes the Git cage by removing the existing directory,
 * cloning the remote l10n cage, and configuring Git user settings.
 *
 * @param options - An object containing the target directory, authentication token, cage URL, username, and email.
 * @returns A Promise that resolves when the cage has been cloned and configured.
 */
export async function initializeGitCage(options: {
	dir: string
	token?: string
	repo: string
	username: string
	email: string
	git: SimpleGit
	branch?: string
}): Promise<void> {
	// Determine the branch to use
	const targetBranch = options.branch || l10nCageBranch()

	// Validate branch for write operations
	validateBranchForWrite(targetBranch)

	// Don't delete existing cage, use setupL10nCage instead
	const setupSuccess = setupL10nCage(options.dir, true, targetBranch)
	if (!setupSuccess) {
		throw new Error('Failed to set up l10n cage')
	}

	/* Skip the destructive rm and clone - setupL10nCage already handles everything */

	await options.git.cwd(options.dir)

	// Test if we're authenticated by checking remote URL format
	try {
		const remoteUrl = await options.git.remote(['get-url', 'origin'])
		const isAuthenticated = remoteUrl.includes('@')
		console.log(`Authentication status: ${isAuthenticated ? 'SUCCESS' : 'FAILURE'}`)
	} catch (err) {
		console.log(`Failed to verify authentication: ${(err as Error).message}`)
	}

	// Always set git config in case we need to make local commits
	await options.git.addConfig('user.name', options.username)
	await options.git.addConfig('user.email', options.email)
}
/**
 * Extracts the latest commit dates for each file by parsing the Git log.
 *
 * @param git - The SimpleGit instance used to retrieve the log.
 * @param repoType - Description of the repository type for logging
 * @returns A Promise that resolves to a Map where keys are file paths and values are the latest commit dates.
 */
export async function getLatestCommitDates(
	git: SimpleGit,
	repoType: string
): Promise<Map<string, Date>> {
	console.log(`Starting git log retrieval for ${repoType} commit dates...`)
	const latestCommitDatesMap = new Map<string, Date>()
	const log = await git.log({
		'--stat': 4096
	})
	for (const entry of log.all) {
		const files = entry.diff?.files
		if (!files) continue
		for (const file of files) {
			if (!latestCommitDatesMap.has(file.file)) {
				latestCommitDatesMap.set(file.file, new Date(entry.date))
			}
		}
	}
	return latestCommitDatesMap
}

/**
 * Generates an appropriate commit message based on whether the l10n file already existed.
 *
 * @param sourceFileName - The name of the source file.
 * @param locale - The locale for the l10n.
 * @param fileExists - Boolean indicating if the file existed.
 * @returns The commit message.
 */
export function getCommitMessage(
	sourceFileName: string,
	locale: string,
	fileExists: boolean
): string {
	return fileExists
		? `Update outdated l10n for ${sourceFileName} in ${locale}`
		: `Create new l10n for ${sourceFileName} in ${locale}`
}

export function cleanUpGitSecrets() {
	fs.unlinkSync(path.join(L10N_CAGE_DIR, '.git/config'))
}
