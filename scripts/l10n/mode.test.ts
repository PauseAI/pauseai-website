import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Mode } from './mode'

describe('Mode', () => {
	// Save original environment
	const originalEnv = {
		CI: process.env.CI,
		L10N_BRANCH: process.env.L10N_BRANCH
	}

	beforeEach(() => {
		// Clean environment before each test
		delete process.env.CI
		delete process.env.L10N_BRANCH
	})

	afterEach(() => {
		// Restore original environment
		Object.entries(originalEnv).forEach(([key, value]) => {
			if (value === undefined) {
				delete process.env[key]
			} else {
				process.env[key] = value
			}
		})
	})

	describe('English-only mode', () => {
		it('returns en-only mode when only English locale is configured', () => {
			const mode = new Mode({ locales: ['en'] })
			expect(mode.mode).toBe('en-only')
			expect(mode.canReadCache).toBe(false)
			expect(mode.canWrite).toBe(false)
			expect(mode.reason).toContain('Only English locale')
		})
	})

	describe('Dry run mode', () => {
		it('returns dry-run mode when isDryRun is true', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				isDryRun: true
			})
			expect(mode.mode).toBe('dry-run')
			expect(mode.canReadCache).toBe(true)
			expect(mode.canWrite).toBe(false)
			expect(mode.reason).toContain('Dry run mode')
		})

		it('allows reading from main branch in dry run mode', () => {
			process.env.L10N_BRANCH = 'main'
			const mode = new Mode({
				locales: ['en', 'de'],
				isDryRun: true,
				apiKey: 'valid-api-key-thats-long-enough'
			})
			expect(mode.mode).toBe('dry-run')
			expect(mode.branch).toBe('main')
			expect(mode.canReadCache).toBe(true)
			expect(mode.canWrite).toBe(false)
		})
	})

	describe('Dry-run mode', () => {
		it('returns dry-run mode when API key is missing', () => {
			const mode = new Mode({
				locales: ['en', 'de']
			})
			expect(mode.mode).toBe('dry-run')
			expect(mode.canReadCache).toBe(true)
			expect(mode.canWrite).toBe(false)
			expect(mode.reason).toContain('No API key')
		})

		it('returns dry-run mode when API key is too short', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: 'short'
			})
			expect(mode.mode).toBe('dry-run')
			expect(mode.canReadCache).toBe(true)
			expect(mode.canWrite).toBe(false)
			expect(mode.reason).toContain('API key too short')
		})

		it('treats API key with exactly 10 characters as valid', () => {
			process.env.L10N_BRANCH = 'feature-branch'
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: '1234567890'
			})
			expect(mode.mode).toBe('perform')
			expect(mode.canWrite).toBe(true)
		})
	})

	describe('Perform mode', () => {
		it('returns perform mode for valid API key on feature branch', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: 'valid-api-key-thats-long-enough',
				branch: 'feature-branch'
			})
			expect(mode.mode).toBe('perform')
			expect(mode.canReadCache).toBe(true)
			expect(mode.canWrite).toBe(true)
			expect(mode.reason).toContain('Local development on feature-branch')
		})

		it('allows CI to write to main branch', () => {
			process.env.CI = 'true'
			process.env.L10N_BRANCH = 'main'
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: 'valid-api-key-thats-long-enough'
			})
			expect(mode.mode).toBe('perform')
			expect(mode.branch).toBe('main')
			expect(mode.canWrite).toBe(true)
			expect(mode.reason).toContain('CI can write to main')
		})

		it('proceeds to perform mode in CI with invalid API key', () => {
			process.env.CI = 'true'
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: 'short' // Invalid API key
			})
			expect(mode.mode).toBe('perform')
			expect(mode.canWrite).toBe(true)
			expect(mode.reason).toContain('CI can write')
			// This ensures CI fails loudly at LLM calls rather than silently dry-running
		})
	})

	describe('Main branch protection', () => {
		it('throws error when local dev tries to write to main', () => {
			process.env.L10N_BRANCH = 'main'
			expect(() => {
				new Mode({
					locales: ['en', 'de'],
					apiKey: 'valid-api-key-thats-long-enough'
				})
			}).toThrow('Cannot write to main branch of the l10n repos from local development')
		})

		it('allows reading from main with no API key', () => {
			process.env.L10N_BRANCH = 'main'
			const mode = new Mode({
				locales: ['en', 'de']
			})
			expect(mode.mode).toBe('dry-run')
			expect(mode.branch).toBe('main')
			expect(mode.canReadCache).toBe(true)
			expect(mode.canWrite).toBe(false)
		})
	})

	describe('Branch detection', () => {
		it('uses branch parameter when provided', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				branch: 'custom-branch'
			})
			expect(mode.branch).toBe('custom-branch')
		})

		it('uses L10N_BRANCH env var when no branch parameter', () => {
			process.env.L10N_BRANCH = 'env-branch'
			const mode = new Mode({
				locales: ['en', 'de']
			})
			expect(mode.branch).toBe('env-branch')
		})
	})

	describe('announce method', () => {
		it('can be called without throwing', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				verbose: true
			})
			expect(() => mode.announce()).not.toThrow()
		})
	})

	describe('force mode options', () => {
		let consoleLogSpy: any

		beforeEach(() => {
			// Spy on console.log to verify announcement output
			consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
		})

		afterEach(() => {
			consoleLogSpy.mockRestore()
		})

		it('stores force mode options correctly', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: 'valid-api-key-thats-long-enough',
				branch: 'feature-branch',
				force: true,
				forceFiles: ['join.md', 'donate.md']
			})
			expect(mode.options.force).toBe(true)
			expect(mode.options.forceFiles).toEqual(['join.md', 'donate.md'])
		})

		it('announces force mode when enabled', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: 'valid-api-key-thats-long-enough',
				branch: 'feature-branch',
				force: true,
				forceFiles: ['join.md']
			})

			mode.announce()

			const output = consoleLogSpy.mock.calls.flat().join('\n')
			expect(output).toContain('Force mode enabled')
			expect(output).toContain('join.md')
		})

		it('announces force mode with multiple files', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: 'valid-api-key-thats-long-enough',
				branch: 'feature-branch',
				force: true,
				forceFiles: ['en.json', '2024-*', 'donate.md']
			})

			mode.announce()

			const output = consoleLogSpy.mock.calls.flat().join('\n')
			expect(output).toContain('Force mode enabled')
			expect(output).toContain('en.json, 2024-*, donate.md')
		})

		it('announces force mode without specific files', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: 'valid-api-key-thats-long-enough',
				branch: 'feature-branch',
				force: true,
				forceFiles: []
			})

			mode.announce()

			const output = consoleLogSpy.mock.calls.flat().join('\n')
			expect(output).toContain('Force mode enabled')
			expect(output).toContain('all files')
		})

		it('shows full force file list in verbose mode', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: 'valid-api-key-thats-long-enough',
				branch: 'feature-branch',
				force: true,
				forceFiles: ['join.md', 'donate.md', 'learn.md', 'action.md', 'faq.md'],
				verbose: true
			})

			mode.announce()

			const output = consoleLogSpy.mock.calls.flat().join('\n')
			expect(output).toContain('Force mode enabled')
			// In verbose mode, should show all files
			expect(output).toContain('join.md')
			expect(output).toContain('donate.md')
			expect(output).toContain('learn.md')
			expect(output).toContain('action.md')
			expect(output).toContain('faq.md')
		})

		it('does not announce force mode when disabled', () => {
			const mode = new Mode({
				locales: ['en', 'de'],
				apiKey: 'valid-api-key-thats-long-enough',
				branch: 'feature-branch',
				force: false
			})

			mode.announce()

			const output = consoleLogSpy.mock.calls.flat().join('\n')
			expect(output).not.toContain('Force mode')
		})
	})
})
