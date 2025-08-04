import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { l10nCageBranch, validateBranchForWrite } from './branch-safety'

describe('Branch Safety', () => {
	// Save original env values
	const originalEnv = {
		CI: process.env.CI,
		L10N_BRANCH: process.env.L10N_BRANCH,
		BRANCH: process.env.BRANCH,
		REVIEW_ID: process.env.REVIEW_ID
	}

	beforeEach(() => {
		// Clean environment for tests
		delete process.env.CI
		delete process.env.L10N_BRANCH
		delete process.env.BRANCH
		delete process.env.REVIEW_ID
	})

	afterEach(() => {
		// Restore original env
		Object.entries(originalEnv).forEach(([key, value]) => {
			if (value === undefined) {
				delete process.env[key]
			} else {
				process.env[key] = value
			}
		})
	})

	describe('L10N_BRANCH override', () => {
		it('detects current git branch without override', () => {
			const branch = l10nCageBranch()
			// Should be the current git branch (l10-preview or whatever is current)
			expect(branch).toBeTruthy()
			expect(typeof branch).toBe('string')
		})

		it('uses L10N_BRANCH when set', () => {
			process.env.L10N_BRANCH = 'my-custom-branch'
			const branch = l10nCageBranch()
			expect(branch).toBe('my-custom-branch')
		})

		it('allows writing to custom branch', () => {
			process.env.L10N_BRANCH = 'my-custom-branch'
			const branch = l10nCageBranch()
			expect(() => validateBranchForWrite(branch)).not.toThrow()
		})

		it('changes branch when L10N_BRANCH changes', () => {
			process.env.L10N_BRANCH = 'first-branch'
			expect(l10nCageBranch()).toBe('first-branch')

			process.env.L10N_BRANCH = 'second-branch'
			expect(l10nCageBranch()).toBe('second-branch')
		})
	})

	describe('Main branch write protection', () => {
		it('blocks local development from writing to main', () => {
			process.env.L10N_BRANCH = 'main'
			expect(() => {
				validateBranchForWrite('main')
			}).toThrow('Cannot write to main l10n branch from local development')
		})

		it('allows local development to write to feature branches', () => {
			process.env.L10N_BRANCH = 'feature-branch'
			const branch = l10nCageBranch()
			expect(() => validateBranchForWrite(branch)).not.toThrow()
		})

		it('allows CI to write to main', () => {
			process.env.CI = 'true'
			process.env.L10N_BRANCH = 'main'
			const branch = l10nCageBranch()
			expect(() => validateBranchForWrite(branch)).not.toThrow()
		})
	})

	describe('CI environment detection', () => {
		beforeEach(() => {
			process.env.CI = 'true'
		})

		it('detects Netlify PR preview branches', () => {
			process.env.REVIEW_ID = '456'
			const branch = l10nCageBranch()
			expect(branch).toBe('pr-456')
		})

		it('detects Netlify branch deploys', () => {
			process.env.BRANCH = 'staging'
			const branch = l10nCageBranch()
			expect(branch).toBe('staging')
		})

		it('falls back to main in CI without branch info', () => {
			// CI=true but no REVIEW_ID or BRANCH
			const branch = l10nCageBranch()
			expect(branch).toBe('main')
		})

		it('prioritizes L10N_BRANCH over CI detection', () => {
			process.env.L10N_BRANCH = 'override-branch'
			process.env.REVIEW_ID = '789'
			process.env.BRANCH = 'other-branch'
			const branch = l10nCageBranch()
			expect(branch).toBe('override-branch')
		})
	})
})
