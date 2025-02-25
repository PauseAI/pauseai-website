// We can't use external dependencies here as they have not been installed yet
import { execSync } from 'child_process'

shouldIgnoreBuild()

/**
 * Main function to decide if we should ignore the build.
 */
function shouldIgnoreBuild() {
	const branchName = getRemoteBranch() // Netlify provides this

	// If branch name doesn't start with "cms", allow build immediately
	if (!branchName || !branchName.startsWith('cms')) {
		console.log(`Branch "${branchName}" does not start with "cms". Allowing build.`)
		process.exit(1)
	}

	const isFork = isForkBranch()
	const firstCommitSHA = getFirstCommitInBranch()
	const latestCommitSHA = getLatestCommitSHA()

	console.log(`Branch name: ${branchName}`)
	console.log(`First commit in branch SHA: ${firstCommitSHA || 'Unknown'}`)
	console.log(`Latest commit SHA: ${latestCommitSHA || 'Unknown'}`)
	console.log(`Is fork: ${isFork === null ? 'Unknown (fail safe)' : isFork}`)

	// Fail safe: If any Git command fails, allow the build
	if (isFork === null || firstCommitSHA === null || latestCommitSHA === null) {
		console.log('Error detected or missing data. Allowing build to proceed.')
		process.exit(1)
	}

	// Cancel build only if it's NOT a fork and this is the first commit
	if (!isFork && firstCommitSHA === latestCommitSHA) {
		console.log('Source is not a fork and this is the first commit in the branch. Ignoring build.')
		process.exit(0)
	}

	console.log('Build should proceed.')
	process.exit(1)
}

/**
 * Gets the current branch name on the remote.
 * @returns {string|null} - The current branch name or null if an error occurs.
 */
function getRemoteBranch() {
	const remoteBranch = runCommand('git symbolic-ref --short refs/remotes/origin/HEAD')
	return remoteBranch?.replace('origin/', '')
}

/**
 * Checks if the branch source is a fork by comparing remote URLs.
 * @returns {boolean|null} - True if the branch is from a fork, false otherwise. Null on error.
 */
function isForkBranch() {
	const originUrl = runCommand('git config --get remote.origin.url')
	const upstreamUrl = runCommand('git config --get remote.upstream.url')

	if (!originUrl) return null // Fail safe
	console.log(`Origin URL: ${originUrl}`)
	console.log(`Upstream URL: ${upstreamUrl || 'Not set'}`)

	return upstreamUrl && originUrl !== upstreamUrl
}

/**
 * Gets the first commit SHA in the current branch.
 * @returns {string|null} - The first commit SHA or null if an error occurs.
 */
function getFirstCommitInBranch() {
	return runCommand('git merge-base --fork-point origin/main')
}

/**
 * Gets the latest commit SHA in the branch.
 * @returns {string|null} - The latest commit SHA or null if an error occurs.
 */
function getLatestCommitSHA() {
	return runCommand('git rev-parse HEAD')
}

/**
 * Runs a shell command and returns the output as a string.
 * Returns null on failure.
 * @param {string} command - The command to execute.
 * @returns {string|null} - The command output or null if an error occurs.
 */
function runCommand(command) {
	try {
		return execSync(command, { encoding: 'utf8' }).trim()
	} catch (error) {
		console.error(`Error executing command: ${command}`, error)
		return null // Fail safe: Don't cancel build if something goes wrong
	}
}
