/**
 * L10n mode determination and configuration
 * Determines how the l10n process should operate based on environment and options
 */

import { l10nCageBranch, canPushToRemote } from './branch-safety'
import { L10N_CAGE_DIR } from '../../src/lib/l10n'

/**
 * L10n operation modes
 */
export type L10nBreed = 'en-only' | 'dry-run' | 'perform'

/**
 * L10n mode configuration options
 */
export interface ModeOptions {
	branch?: string
	isDryRun?: boolean
	apiKey?: string
	locales?: readonly string[]
	verbose?: boolean
	force?: boolean
	forceFiles?: string[]
}

/**
 * L10n mode manager
 * Determines and describes how the l10n process will operate
 */
export class Mode {
	readonly mode: L10nBreed
	readonly canReadCache: boolean
	readonly canWrite: boolean
	readonly branch: string
	readonly reason: string
	readonly isCI: boolean
	readonly options: ModeOptions

	constructor(options: ModeOptions = {}) {
		this.options = options
		this.isCI = process.env.CI === 'true'
		const result = this.determine()
		this.mode = result.mode
		this.canReadCache = result.canReadCache
		this.canWrite = result.canWrite
		this.branch = result.branch
		this.reason = result.reason
	}

	/**
	 * Determine the l10n operation mode
	 */
	private determine(): {
		mode: L10nBreed
		canReadCache: boolean
		canWrite: boolean
		branch: string
		reason: string
	} {
		const branch = this.options.branch || l10nCageBranch()

		// Check if only English locale
		if (
			this.options.locales &&
			this.options.locales.length === 1 &&
			this.options.locales[0] === 'en'
		) {
			return {
				mode: 'en-only',
				canReadCache: false,
				canWrite: false,
				branch,
				reason: 'Only English locale configured'
			}
		}

		// Check for dry run mode (explicit flag or missing/invalid API key in local dev)
		const hasValidApiKey = this.options.apiKey && this.options.apiKey.length >= 10
		const shouldDryRun = this.options.isDryRun || (!hasValidApiKey && !this.isCI)

		if (shouldDryRun) {
			return {
				mode: 'dry-run',
				canReadCache: true,
				canWrite: false,
				branch,
				reason: this.options.isDryRun
					? 'Dry run mode requested'
					: this.options.apiKey
						? 'API key too short (< 10 chars)'
						: 'No API key provided'
			}
		}

		// Full perform mode - check if allowed
		const isMainBranch = branch === 'main'

		if (!this.isCI && isMainBranch) {
			// This would write to main from local dev - not allowed
			throw new Error(
				'Cannot write to main branch of the l10n repos from local development.\n' +
					'Options:\n' +
					'1. Work on a feature branch (recommended)\n' +
					'2. Set L10N_BRANCH=<your-branch> in .env\n' +
					'3. Use dry-run mode by commenting out L10N_OPENROUTER_API_KEY\n' +
					'4. Use --dry-run flag to preview without performing l10ns'
			)
		}

		// Test Git credentials for pushing (only in local dev)
		if (!this.isCI && !canPushToRemote(L10N_CAGE_DIR)) {
			throw new Error(
				'Git push authentication failed.\n' +
					'GitHub requires a Personal Access Token, not your password.\n' +
					'Create one at: https://github.com/settings/tokens\n' +
					'Required scopes: repo (for private repos) or public_repo (for public repos)\n' +
					'\nAlternatively, use dry-run mode: pnpm l10n --dryRun'
			)
		}

		return {
			mode: 'perform',
			canReadCache: true,
			canWrite: true,
			branch,
			reason: this.isCI ? `CI can write to ${branch}` : `Local development on ${branch} branch`
		}
	}

	/**
	 * Announce/describe what the l10n process will do
	 */
	announce(): void {
		// Main mode announcement
		switch (this.mode) {
			case 'en-only':
				console.log('🌐 L10n Mode: en-only: Can copy English files to build directory')
				break

			case 'dry-run':
				console.log(`🌐 L10n Mode: dry-run: Reading cage ${this.branch}, no LLM calls, no writes`)
				break

			case 'perform':
				console.log(`🌐 L10n Mode: perform: Cage ${this.branch}, can call LLM, update, and push`)
				break
		}

		// Force mode info
		if (this.options.force) {
			console.log('\n⚡ Force mode enabled')
			if (this.options.forceFiles && this.options.forceFiles.length > 0) {
				console.log(`   → Forcing re-l10n of: ${this.options.forceFiles.join(', ')}`)
			} else {
				console.log('   → Forcing re-l10n of all files')
			}
		}

		// Verbose mode hint
		if (!this.options.verbose && this.mode === 'dry-run') {
			console.log('💡 Tip: Use --verbose to see detailed file-by-file status')
		}

		// Show detailed reasoning in verbose mode
		if (this.options.verbose) {
			console.log('\n📋 Decision details:')
			console.log(`   → Reason: ${this.reason}`)
			console.log(`   → Can read cage: ${this.canReadCache}`)
			console.log(`   → Can write: ${this.canWrite}`)
		}

		console.log()
	}
}
