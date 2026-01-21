# Testing Patterns

**Analysis Date:** 2026-01-20

## Test Framework

**Runner:**

- Vitest 2.1.9
- Config: No dedicated `vitest.config.*` file found; uses default Vitest configuration with TypeScript support

**Assertion Library:**

- Vitest built-in assertions (from `vitest` package)
- Uses `expect()` API (compatible with Jest)

**Run Commands:**

```bash
pnpm test              # Run all tests
pnpm test --watch     # Watch mode (inferred from package.json convention)
pnpm test --coverage  # Coverage report (inferred from Vitest defaults)
```

## Test File Organization

**Location:**

- Co-located with source files in same directory
- Pattern: Source file + `.test.ts` suffix

**Naming:**

- `[filename].test.ts` (e.g., `index.test.ts`, `mode.test.ts`, `l10ntamer.test.ts`)
- Matches corresponding implementation file name

**Structure:**

```
src/lib/clients/luma/
├── index.ts           # Implementation
├── index.test.ts      # Tests
└── types/
    └── calendar/
        └── get-items.ts

scripts/l10n/
├── mode.ts            # Implementation
├── mode.test.ts       # Tests
└── branch-safety.ts   # Implementation
└── branch-safety.test.ts  # Tests
```

## Test Structure

**Suite Organization:**
Tests use `describe()` to organize related test cases by feature or function:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Mode', () => {
	const originalEnv = {
		CI: process.env.CI,
		L10N_BRANCH: process.env.L10N_BRANCH
	}

	beforeEach(() => {
		delete process.env.CI
		delete process.env.L10N_BRANCH
	})

	afterEach(() => {
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
		})
	})
})
```

**Patterns:**

- Nested `describe()` blocks to group related tests by feature
- Setup in `beforeEach()` hooks (clean environment state, mock setup)
- Teardown in `afterEach()` hooks (restore original state, clean up resources)
- Assertion pattern uses `.toBe()`, `.toEqual()`, `.toContain()` etc.

## Mocking

**Framework:** Vitest's `vi` object for mocking and spying

**Patterns:**
Mocking external modules with `vi.mock()`:

```typescript
vi.mock('../src/lib/paraglide/runtime.js', () => ({
	localizeHref: vi
		.fn()
		.mockImplementation((href: string, { locale }: { locale: string }) => `/${locale}${href}`),
	locales: ['en']
}))
```

Spying on console methods:

```typescript
let consoleLogSpy: MockInstance<typeof console.log>

beforeEach(() => {
	consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
	consoleLogSpy.mockRestore()
})
```

Then verify output was called:

```typescript
mode.announce()
const output = consoleLogSpy.mock.calls.flat().join('\n')
expect(output).toContain('Force mode enabled')
```

**What to Mock:**

- External module dependencies (e.g., `paraglide/runtime.js`)
- Console methods when testing logging behavior
- Do NOT mock: file system operations in integration tests (use real fs)

**What NOT to Mock:**

- Integration tests interact with real filesystem (see `l10ntamer.test.ts`)
- Integration tests fetch real data where possible
- Core functions being tested should not be mocked

## Fixtures and Factories

**Test Data:**
Inline test data using constants:

```typescript
const AZUKI_CALENDAR_ID = 'cal-kLFnev8X6JsxPOK'

describe('Calendar.getItems', () => {
	it('returns events with a name', async () => {
		const items = await luma.Calendar.getItems({
			calendarApiId: AZUKI_CALENDAR_ID,
			period: 'future',
			paginationLimit: 20
		})
		expect(items.entries[0].event.name).toBeTruthy()
	})
})
```

Integration test fixtures using real filesystem:

```typescript
const testDir = 'test_dir'

beforeEach(() => {
	fs.mkdirSync(testDir, { recursive: true })
	fs.writeFileSync(path.join(testDir, 'file1.txt'), 'test')
	fs.mkdirSync(path.join(testDir, 'subdir'), { recursive: true })
	fs.writeFileSync(path.join(testDir, 'subdir', 'file3.txt'), 'test')
})

afterEach(() => {
	fs.rmSync(testDir, { recursive: true, force: true })
})
```

**Location:**

- Inline constants in test files
- Expected files referenced as string paths (no separate fixtures directory)

## Coverage

**Requirements:** Not enforced (no coverage configuration detected)

**View Coverage:**

```bash
pnpm test --coverage  # Estimated command
```

## Test Types

**Unit Tests:**

- Scope: Individual functions and class methods
- Approach: Direct function calls with mocked dependencies
- Example: `Calendar.getItems()` test in `src/lib/clients/luma/index.test.ts`
- Uses real data where appropriate (e.g., real API calls to Luma Calendar)

**Integration Tests:**

- Scope: Multiple functions working together, filesystem operations
- Approach: Real filesystem interaction, environment variable manipulation
- Examples:
  - `Force mode integration tests` in `scripts/l10n/force.test.ts` - Tests pattern resolution against real files
  - `findFilesRecursively` test in `scripts/l10ntamer.test.ts` - Creates and cleans up test directory structure
  - `Mode` class tests manipulate environment variables and test interactions

**E2E Tests:**

- Framework: Not used
- Note: No E2E test framework detected in codebase

## Common Patterns

**Async Testing:**

```typescript
it('returns events with a name', async () => {
	const items = await luma.Calendar.getItems({
		calendarApiId: AZUKI_CALENDAR_ID,
		period: 'future',
		paginationLimit: 20
	})
	expect(items.entries[0].event.name).toBeTruthy()
})
```

**Error Testing:**

```typescript
it('throws error when local dev tries to write to main', () => {
	process.env.L10N_BRANCH = 'main'
	expect(() => {
		new Mode({
			locales: ['en', 'de'],
			apiKey: 'valid-api-key-thats-long-enough'
		})
	}).toThrow('Cannot write to main branch of the l10n repos from local development')
})
```

**Environment Variable Testing:**

```typescript
describe('L10N_BRANCH override', () => {
	beforeEach(() => {
		delete process.env.CI
		delete process.env.L10N_BRANCH
	})

	afterEach(() => {
		Object.entries(originalEnv).forEach(([key, value]) => {
			if (value === undefined) {
				delete process.env[key]
			} else {
				process.env[key] = value
			}
		})
	})

	it('uses L10N_BRANCH when set', () => {
		process.env.L10N_BRANCH = 'my-custom-branch'
		const branch = l10nCageBranch()
		expect(branch).toBe('my-custom-branch')
	})
})
```

**Spy and Mock Output Testing:**

```typescript
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
```

**Test Case Organization with Multiple Scenarios:**

```typescript
describe('Branch Safety', () => {
	describe('Main branch write protection', () => {
		it('blocks local development from writing to main', () => {
			// Test 1
		})

		it('allows local development to write to feature branches', () => {
			// Test 2
		})

		it('allows CI to write to main', () => {
			// Test 3
		})
	})

	describe('CI environment detection', () => {
		it('detects Netlify PR preview branches', () => {
			// Test 4
		})
	})
})
```

## Test Execution

**Current test files:**

- `src/lib/clients/luma/index.test.ts` - API client unit tests
- `scripts/l10n/mode.test.ts` - Localization mode logic tests (comprehensive, 95+ test cases)
- `scripts/l10n/branch-safety.test.ts` - Git branch safety tests
- `scripts/l10n/force.test.ts` - Pattern resolution integration tests
- `scripts/l10ntamer.test.ts` - File recursion utility tests

**Coverage areas:**

- API client integration
- Localization build script logic
- Environment variable handling
- Filesystem operations
- Pattern matching and glob support

---

_Testing analysis: 2026-01-20_
