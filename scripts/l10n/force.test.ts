/**
 * Integration tests for --force mode functionality
 * Tests the actual force pattern resolution against the real filesystem
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync } from 'fs'
import { resolve as resolveForcePatterns } from './force'

describe('Force mode integration tests', () => {
	const MARKDOWN_SOURCE = 'src/posts'

	// Files we expect to exist and use in our tests
	const expectedFiles = {
		messages: 'messages/en.json',
		posts: {
			'join.md': 'src/posts/join.md',
			'donate.md': 'src/posts/donate.md',
			'learn.md': 'src/posts/learn.md',
			'action.md': 'src/posts/action.md',
			'faq.md': 'src/posts/faq.md',
			'2024-november.md': 'src/posts/2024-november.md',
			'2024-february.md': 'src/posts/2024-february.md'
		}
	}

	beforeAll(() => {
		// Verify our test assumptions - these files should exist
		expect(existsSync(expectedFiles.messages), `Expected ${expectedFiles.messages} to exist`).toBe(
			true
		)

		for (const [filename, filepath] of Object.entries(expectedFiles.posts)) {
			expect(existsSync(filepath), `Expected ${filepath} to exist for testing`).toBe(true)
		}
	})

	describe('Pattern resolution against real filesystem', () => {
		it('resolves exact filename patterns', async () => {
			const result = await resolveForcePatterns(['join.md'], MARKDOWN_SOURCE)
			expect(result).toContain('join.md')
			expect(result).not.toContain('donate.md')
			expect(result.length).toBe(1)
		})

		it('resolves multiple exact filenames', async () => {
			const result = await resolveForcePatterns(
				['join.md', 'donate.md', 'learn.md'],
				MARKDOWN_SOURCE
			)
			expect(result).toContain('join.md')
			expect(result).toContain('donate.md')
			expect(result).toContain('learn.md')
			expect(result).not.toContain('action.md')
		})

		it('resolves "*" to include all source files', async () => {
			const result = await resolveForcePatterns(['*'], MARKDOWN_SOURCE)
			expect(result).toContain('en.json')
			expect(result).toContain('join.md')
			expect(result).toContain('donate.md')
			expect(result).toContain('2024-november.md')
			// Should have many files
			expect(result.length).toBeGreaterThan(10)
		})

		it('resolves prefix patterns like "2024-*"', async () => {
			const result = await resolveForcePatterns(['2024-*'], MARKDOWN_SOURCE)
			expect(result).toContain('2024-november.md')
			expect(result).toContain('2024-february.md')
			expect(result).not.toContain('join.md')
			expect(result).not.toContain('en.json')
			// All results should start with "2024-"
			expect(result.every((f) => f.startsWith('2024-'))).toBe(true)
		})

		it('combines different pattern types', async () => {
			const result = await resolveForcePatterns(['en.json', '2024-*', 'donate.md'], MARKDOWN_SOURCE)
			expect(result).toContain('en.json')
			expect(result).toContain('donate.md')
			expect(result).toContain('2024-november.md')
			expect(result).toContain('2024-february.md')
		})

		it('handles non-existent files gracefully', async () => {
			const result = await resolveForcePatterns(['nonexistent.md', 'join.md'], MARKDOWN_SOURCE)
			expect(result).toContain('join.md')
			expect(result).not.toContain('nonexistent.md')
			expect(result.length).toBe(1)
		})

		it('returns empty array for no matches', async () => {
			const result = await resolveForcePatterns(['xyz-nonexistent-*'], MARKDOWN_SOURCE)
			expect(result).toEqual([])
		})

		it('deduplicates when patterns overlap', async () => {
			const result = await resolveForcePatterns(['join.md', 'join.md', 'joi*'], MARKDOWN_SOURCE)
			const joinCount = result.filter((f) => f === 'join.md').length
			expect(joinCount).toBe(1)
		})

		it('handles empty pattern array', async () => {
			const result = await resolveForcePatterns([], MARKDOWN_SOURCE)
			expect(result).toEqual([])
		})

		// Test that glob patterns now work
		it('supports *.md pattern', async () => {
			const result = await resolveForcePatterns(['*.md'], MARKDOWN_SOURCE)
			expect(result.length).toBeGreaterThan(0)
			expect(result.every((f) => f.endsWith('.md'))).toBe(true)
			expect(result).not.toContain('en.json')
		})

		it('supports patterns with extensions like 2024-*.md', async () => {
			const result = await resolveForcePatterns(['2024-*.md'], MARKDOWN_SOURCE)
			expect(result.length).toBeGreaterThan(0)
			expect(result.every((f) => f.startsWith('2024-') && f.endsWith('.md'))).toBe(true)
		})
	})

	describe('Additional glob patterns', () => {
		it('should support **/*.md for recursive markdown files', async () => {
			const result = await resolveForcePatterns(['**/*.md'], MARKDOWN_SOURCE)
			expect(result.length).toBeGreaterThan(0)
			expect(result.every((f) => f.endsWith('.md'))).toBe(true)
			expect(result).toContain('join.md')
		})

		it('should support character classes like 202[34]-*.md', async () => {
			const result = await resolveForcePatterns(['202[34]-*.md'], MARKDOWN_SOURCE)
			expect(result).toContain('2024-november.md')
			expect(result).toContain('2023-november-uk.md')
			expect(result).not.toContain('2025-something.md')
		})

		it('should support brace expansion like {join,donate,learn}.md', async () => {
			const result = await resolveForcePatterns(['{join,donate,learn}.md'], MARKDOWN_SOURCE)
			expect(result.sort()).toEqual(['donate.md', 'join.md', 'learn.md'])
		})
	})
})
