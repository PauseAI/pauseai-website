# Coding Conventions

**Analysis Date:** 2026-01-20

## Naming Patterns

**Files:**

- Components: PascalCase (e.g., `Button.svelte`, `NationalGroupItem.svelte`, `LoadingSpinner.svelte`)
- Utilities/Libraries: camelCase (e.g., `nationalGroups.ts`, `l10n.ts`, `config.ts`, `theme.ts`)
- API routes: kebab-case in folder structure (e.g., `src/routes/api/chat/+server.ts`, `src/routes/api/donorbox-meter/[slug]/+server.ts`)
- Test files: Match source file name with `.test.ts` suffix (e.g., `index.test.ts`, `mode.test.ts`, `l10ntamer.test.ts`)

**Functions:**

- Exported functions: camelCase (e.g., `loadNationalGroups`, `toggleTheme`, `extractAirtableIds`, `getDefaultSettings`)
- Private/helper functions: camelCase with optional underscore prefix (e.g., `getInstruction`)
- Async functions: No special naming convention, but async/await pattern is standard

**Variables:**

- Constants (module-level): UPPER_SNAKE_CASE (e.g., `AZUKI_CALENDAR_ID`, `L10N_CAGE_DIR`, `MARKDOWN_L10NS`, `BASE_URL`)
- Local variables/parameters: camelCase (e.g., `items`, `messages`, `apiKey`, `branch`)
- Boolean flags: camelCase, often with `is`/`can`/`has` prefix (e.g., `isDryRun`, `canWrite`, `hasCollagenUid`)

**Types:**

- Type definitions: PascalCase (e.g., `ChatResponse`, `Message`, `Personality`, `NationalGroup`, `AirtableRecord`)
- Generic type parameters: Single uppercase letter or PascalCase (e.g., `T`, `FieldSet`)
- Imported types: Use `type` keyword (e.g., `import type GetItems from './types/calendar/get-items.js'`)

## Code Style

**Formatting:**

- Tool: Prettier 3.8.0
- Config file: `.prettierrc`
- Key settings:
  - `semi: false` - No semicolons
  - `useTabs: true` - Use tabs for indentation
  - `singleQuote: true` - Single quotes for strings
  - `trailingComma: "none"` - No trailing commas
  - `printWidth: 100` - Line length limit
  - `endOfLine: "auto"` - Handle line endings automatically
  - Svelte parser configured via `prettier-plugin-svelte`

**Linting:**

- Tool: ESLint 9.39.2 with flat config
- Config file: `eslint.config.js`
- Key rules:
  - TypeScript ESLint recommended rules enabled
  - Svelte plugin rules configured
  - Unused variables flagged with pattern: variables starting with underscore are allowed (e.g., `_filename`)
  - Restricted HTML elements: `<a>` tags must use `$lib/components/Link.svelte` or `$lib/components/LinkWithoutIcon.svelte`
  - No restricted imports from `**/custom` directories (use direct imports instead)
  - Markdown linting enabled with custom rules

## Import Organization

**Order:**

1. External packages from node_modules (e.g., `import axios from 'axios'`)
2. SvelteKit/framework imports (e.g., `import { writable } from 'svelte/store'`, `import { error, json } from '@sveltejs/kit'`)
3. Absolute path imports with aliases (e.g., `import type { NationalGroup } from '$lib/types'`)
4. Relative imports (when necessary)

**Path Aliases:**

- `$lib/` - Points to `src/lib/`
- `$env/dynamic/private` - Private environment variables (server-side only)
- `$app/environment` - App environment utilities (e.g., `dev` flag)

## Error Handling

**Patterns:**

- Try/catch blocks for async operations and external API calls
- Error logging uses `console.error()` with descriptive messages
- Example pattern from `nationalGroups.ts`:
  ```typescript
  try {
  	const response = await fetch('/api/national-groups')
  	if (!response.ok) {
  		throw new Error('Failed to fetch national groups')
  	}
  	const data = await response.json()
  	// Handle data
  } catch (error) {
  	console.error('Error loading national groups:', error)
  	return []
  }
  ```
- SvelteKit API routes use `error()` from `@sveltejs/kit` for HTTP errors
- Fallback data patterns used in development mode (see `src/lib/airtable.ts`)

## Logging

**Framework:** console methods (no external logging library)

**Patterns:**

- `console.log()` - For informational messages, development output
- `console.warn()` - For warnings about missing configuration or non-fatal issues (e.g., ⚠️ emoji prefix sometimes used)
- `console.error()` - For error conditions and exceptions
- Development context checking: Use `isDev()` helper to conditionally log verbose information
- Emoji prefixes sometimes used in warnings (e.g., `⚠️ Airtable API key not configured...`)

## Comments

**When to Comment:**

- JSDoc-style comments for module-level exports and public functions
- Inline comments for complex logic or non-obvious implementations
- Config file comments explaining settings and purposes (see `l10n.ts` for examples)

**JSDoc/TSDoc:**

- Used for exported functions and types
- Pattern: Block comment with description, `@param` annotations, and `@returns` annotation
- Example from `l10n.ts`:
  ```typescript
  /**
   * Get the complete default settings object
   * @returns The full default settings object with all properties
   */
  export function getDefaultSettings(): typeof defaultSettingsConfig {
  	return defaultSettingsConfig
  }
  ```

## Function Design

**Size:**

- Most functions are small (< 20 lines)
- Complex operations broken into smaller utilities
- Example: `loadNationalGroups()` is concise and focused on a single responsibility

**Parameters:**

- Functions often use object destructuring for parameters when multiple arguments needed
- Example from `Calendar.getItems()`:
  ```typescript
  async getItems(params: {
    calendarApiId: string
    period: 'future'
    paginationLimit: number
  }): Promise<GetItems>
  ```

**Return Values:**

- Async functions return typed Promises
- Functions document return types explicitly
- Fallback returns used for error cases (e.g., empty arrays `[]`)

## Module Design

**Exports:**

- Named exports preferred over default exports
- Type exports explicitly marked with `export type` keyword
- Barrel files used at `src/lib/components/custom/index.ts` to re-export

**Barrel Files:**

- `src/lib/components/custom/index.ts` used for mdsvex component adapter exports
- ESLint rule prevents direct imports from `custom` directory (enforce barrel file usage)

## Svelte Conventions

**Component Script Blocks:**

- TypeScript enabled in all Svelte components via `<script lang="ts">`
- Props exported as top-level variables (e.g., `export let subtle = false`)
- Event handlers inline using `on:click` directives

**Component Styling:**

- Scoped CSS via `<style>` block (default Svelte behavior)
- CSS variables used for theming (e.g., `var(--brand)`, `var(--background)`)
- Class modifiers for state variations (e.g., `button.subtle`, `button.disabled`)

**Example from `Button.svelte`:**

```svelte
<script lang="ts">
	export let subtle = false
	export let disabled = false
</script>

<button on:click class:subtle class:disabled>
	<slot />
</button>

<style>
	button {
		background-color: var(--brand);
		/* ... */
	}
</style>
```

---

_Convention analysis: 2026-01-20_
