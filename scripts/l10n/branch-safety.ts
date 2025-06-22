/**
 * L10n branch safety and Git authentication utilities
 *
 * This module provides branch safety validation and Git operations
 * to ensure l10n operations don't interfere with main branch workflows.
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { SimpleGit } from 'simple-git'
import { cageUrl } from './git-ops'

/**
 * Get the current Git branch name of the pauseai-website working directory
 * @returns The current branch name or 'main' as fallback
 */
function currentWebsiteBranch(): string {
	try {
		const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
		return branch || 'main'
	} catch (error) {
		console.warn('Failed to detect current Git branch, defaulting to main')
		return 'main'
	}
}

/**
 * Determine which l10n cage branch to use based on environment
 * @returns The l10n cage branch name
 */
export function l10nCageBranch(): string {
	// 1. Explicit override via environment variable
	if (process.env.L10N_BRANCH) {
		return process.env.L10N_BRANCH
	}

	// 2. CI environment detection
	if (process.env.CI === 'true') {
		// Netlify PR preview
		if (process.env.REVIEW_ID) {
			const branch = `pr-${process.env.REVIEW_ID}`
			return branch
		}
		// Netlify branch deploy or other CI
		if (process.env.BRANCH) {
			return process.env.BRANCH
		}
		// Fallback for CI without branch info
		return 'main'
	}

	// 3. Local development - use current Git branch
	const websiteBranch = currentWebsiteBranch()
	return websiteBranch
}

/**
 * Validate if writing to the l10n branch is allowed
 * @param branch The branch to validate
 * @throws Error if attempting to write to main from local development
 */
export function validateBranchForWrite(branch: string): void {
	// Prevent local development from writing to main
	if (process.env.CI !== 'true' && branch === 'main') {
		throw new Error(
			'Cannot write to main l10n branch from local development.\n' +
				'Options:\n' +
				'1. Work on a feature branch (recommended)\n' +
				'2. Set L10N_BRANCH=<your-branch> in .env\n' +
				'3. Use read-only mode by commenting out L10N_OPENROUTER_API_KEY'
		)
	}
}

/**
 * Configure Git authentication for existing repository
 * @param cageDir Directory of the l10n cage repository
 * @param verbose Whether to log detailed output
 */
function configureGitAuthentication(cageDir: string, verbose = false): void {
	const url = cageUrl()
	const setUrlCommand = `cd ${cageDir} && git remote set-url origin ${url}`
	execSync(setUrlCommand, { stdio: 'pipe' })
	if (verbose) {
		const authMethod = process.env.GITHUB_TOKEN ? 'token authentication' : 'SSH'
		console.log(`  🔧 Configured remote with ${authMethod}`)
	}
}

/**
 * Set up branch and tracking for the l10n cage
 * @param cageDir Directory of the l10n cage
 * @param branch The branch to set up
 * @param verbose Whether to log detailed output
 */
function setupBranchAndTracking(cageDir: string, branch: string, verbose: boolean): void {
	// Configure authentication for git remote operations
	configureGitAuthentication(cageDir, verbose)

	// Check if the branch exists locally
	const localBranchCommand = `cd ${cageDir} && git rev-parse --verify ${branch} 2>/dev/null || echo "not found"`
	const localBranchExists =
		execSync(localBranchCommand, { encoding: 'utf8' }).trim() !== 'not found'

	if (!localBranchExists) {
		// Check if remote branch exists
		const remoteBranchCommand = `cd ${cageDir} && git ls-remote --heads origin ${branch} | wc -l`
		const remoteBranchExists = execSync(remoteBranchCommand, { encoding: 'utf8' }).trim() !== '0'

		if (remoteBranchExists) {
			// Create local branch from remote (automatically sets up tracking)
			const checkoutCommand = `cd ${cageDir} && git checkout -b ${branch} origin/${branch}`
			execSync(checkoutCommand, {
				stdio: verbose ? 'inherit' : 'ignore'
			})
			if (verbose) console.log(`  ✓ Created and switched to ${branch} branch from remote`)
		} else {
			// Create new local branch (NO upstream setup yet)
			const createBranchCommand = `cd ${cageDir} && git checkout -b ${branch}`
			execSync(createBranchCommand, {
				stdio: verbose ? 'inherit' : 'ignore'
			})
			if (verbose)
				console.log(`  ✓ Created new ${branch} branch (upstream will be set on first push)`)
		}
	} else {
		// Branch exists, just checkout
		const checkoutExistingCommand = `cd ${cageDir} && git checkout ${branch}`
		execSync(checkoutExistingCommand, { stdio: verbose ? 'inherit' : 'ignore' })
		if (verbose) console.log(`  ✓ Switched to ${branch} branch`)
	}

	// Only set upstream if remote branch actually exists
	const remoteBranchExists =
		execSync(`cd ${cageDir} && git ls-remote --heads origin ${branch} | wc -l`, {
			encoding: 'utf8'
		}).trim() !== '0'
	if (remoteBranchExists) {
		const currentUpstream = execSync(
			`cd ${cageDir} && git rev-parse --abbrev-ref ${branch}@{upstream} 2>/dev/null || echo "none"`,
			{ encoding: 'utf8' }
		).trim()
		if (currentUpstream === 'none') {
			execSync(`cd ${cageDir} && git branch --set-upstream-to=origin/${branch} ${branch}`, {
				stdio: 'ignore'
			})
			if (verbose) console.log(`  ✓ Set up tracking for ${branch}`)
		}
	}
}

/**
 * Check if the l10n cage has uncommitted changes or unpushed commits
 * @param cageDir Directory of the l10n cage
 * @returns Details string if there are endangered l10ns, empty string if safe
 */
export function hasEndangeredL10ns(cageDir: string): string {
	try {
		// Check if cage directory and git repo exist
		if (!fs.existsSync(path.join(cageDir, '.git'))) {
			return ''
		}

		const details: string[] = []

		// Check for uncommitted changes
		const statusOutput = execSync(`cd ${cageDir} && git status --porcelain`, { encoding: 'utf8' })
		if (statusOutput.trim()) {
			const lines = statusOutput.trim().split('\n')
			details.push(`• ${lines.length} uncommitted file(s):`)
			lines.slice(0, 5).forEach((line) => {
				const status = line.substring(0, 2)
				const file = line.substring(3)
				const statusDesc = status.includes('M')
					? 'modified'
					: status.includes('A')
						? 'added'
						: status.includes('D')
							? 'deleted'
							: 'changed'
				details.push(`  - ${file} (${statusDesc})`)
			})
			if (lines.length > 5) {
				details.push(`  ... and ${lines.length - 5} more`)
			}
		}

		// Check for unpushed commits (if upstream exists)
		try {
			const unpushedCount = execSync(`cd ${cageDir} && git rev-list @{u}..HEAD --count`, {
				encoding: 'utf8'
			})
			const count = parseInt(unpushedCount.trim())
			if (count > 0) {
				details.push(`• ${count} unpushed commit(s)`)

				// Show recent unpushed commit messages
				const recentCommits = execSync(`cd ${cageDir} && git log @{u}..HEAD --oneline -n 3`, {
					encoding: 'utf8'
				})
				if (recentCommits.trim()) {
					details.push('  Recent commits:')
					recentCommits
						.trim()
						.split('\n')
						.forEach((commit) => {
							details.push(`  - ${commit}`)
						})
				}
			}
		} catch {
			// No upstream set up or other git error - not necessarily dangerous
			// Only report if we already found uncommitted changes
		}

		return details.join('\n')
	} catch (error) {
		// Git error, assume safe to avoid blocking normal operations
		return ''
	}
}

/**
 * Push changes to remote, automatically setting upstream for new branches
 * @param git SimpleGit instance for the repository
 * @param verbose Whether to log detailed output
 *
 * Note: This handles upstream setting for branches that didn't exist during setup.
 * setupBranchAndTracking() sets upstream for existing remote branches (enabling pulls),
 * but new branches need upstream set during their first push (when remote branch is created).
 */
export async function pushWithUpstream(git: SimpleGit, verbose = false): Promise<void> {
	try {
		// Check if current branch has upstream tracking
		await git.raw(['rev-parse', '--abbrev-ref', '@{upstream}'])
		// Upstream exists, use normal push
		await git.push()
		if (verbose) console.log('  ✓ Pushed to existing upstream')
	} catch (e) {
		// No upstream, use push with --set-upstream
		const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD'])
		if (verbose) console.log(`  ✓ Setting upstream for new branch: ${currentBranch}`)
		await git.push(['--set-upstream', 'origin', currentBranch])
	}
}

/**
 * Check if Git credentials work for pushing to remote by testing them now
 * @param cageDir Path to the l10n cage directory
 * @returns true if credentials work
 */
export function canPushToRemote(cageDir: string): boolean {
	try {
		// Configure Git for seamless operation
		execSync(`cd ${cageDir} && git config push.autoSetupRemote true`, { stdio: 'pipe' })

		// Check current remote URL
		const currentRemote = execSync(`cd ${cageDir} && git remote get-url origin`, {
			encoding: 'utf8'
		}).trim()

		// If using HTTPS, try switching to SSH (which often works better)
		if (currentRemote.startsWith('https://github.com/')) {
			const sshUrl = currentRemote.replace('https://github.com/', 'git@github.com:')
			try {
				// Test SSH access quietly first
				execSync(`cd ${cageDir} && git ls-remote ${sshUrl}`, { stdio: 'pipe', timeout: 5000 })
				// SSH works, switch to it
				execSync(`cd ${cageDir} && git remote set-url origin ${sshUrl}`, { stdio: 'pipe' })
				console.log('🔧 Switched to SSH authentication (more reliable than HTTPS)')
			} catch {
				// SSH doesn't work, stick with HTTPS
				console.log('🔐 Testing Git push credentials...')
				console.log('    If prompted, use your Personal Access Token as the password')
				console.log('    Create a token at: https://github.com/settings/tokens')
			}
		}

		// Test credentials with current URL (SSH or HTTPS)
		execSync(`cd ${cageDir} && git push --dry-run`, {
			stdio: 'inherit'
		})

		console.log('✅ Git push access verified')
		return true
	} catch (error) {
		return false
	}
}

// Export setupBranchAndTracking for internal use by git-ops
export { setupBranchAndTracking }
