import { findFilesRecursively } from './l10ntamer'
import fs from 'fs'
import path from 'path'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../src/lib/paraglide/runtime.js', () => {
	return {
		localizeHref: vi
			.fn()
			.mockImplementation((href: string, { locale }: { locale: string }) => `/${locale}${href}`),
		locales: ['en']
	}
})

describe('findFilesRecursively', () => {
	const testDir = 'test_dir'

	// Mock directory structure:
	// test_dir/
	// ├── file1.txt
	// ├── file2.js
	// └── subdir/
	//     ├── file3.txt
	//     └── file4.js
	beforeEach(() => {
		fs.mkdirSync(testDir, { recursive: true })
		fs.writeFileSync(path.join(testDir, 'file1.txt'), 'test')
		fs.writeFileSync(path.join(testDir, 'file2.js'), 'test')
		fs.mkdirSync(path.join(testDir, 'subdir'), { recursive: true })
		fs.writeFileSync(path.join(testDir, 'subdir', 'file3.txt'), 'test')
		fs.writeFileSync(path.join(testDir, 'subdir', 'file4.js'), 'test')
	})

	afterEach(() => {
		// Remove the mock directory structure
		fs.rmSync(testDir, { recursive: true, force: true })
	})

	it('should find all files with the specified extension recursively', () => {
		const txtFiles = findFilesRecursively(testDir, 'txt')
		expect(txtFiles).toEqual([
			path.join('test_dir', 'file1.txt'),
			path.join('test_dir', 'subdir', 'file3.txt')
		])

		const jsFiles = findFilesRecursively(testDir, 'js')
		expect(jsFiles).toEqual([
			path.join('test_dir', 'file2.js'),
			path.join('test_dir', 'subdir', 'file4.js')
		])
	})

	it('should return an empty array if no files with the specified extension are found', () => {
		const mdFiles = findFilesRecursively(testDir, 'md')
		expect(mdFiles).toEqual([])
	})
})
