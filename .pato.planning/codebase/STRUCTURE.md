# Codebase Structure

**Analysis Date:** 2026-01-20

## Directory Layout

```
pauseai/
├── src/                              # Main application source code
│   ├── routes/                       # SvelteKit route definitions (file-based routing)
│   │   ├── api/                      # REST API endpoints
│   │   ├── [slug]/                   # Dynamic slug routes (blog posts, events)
│   │   ├── about/                    # About page route
│   │   ├── communities/              # Communities page route
│   │   ├── contact-us/               # Contact form page route
│   │   ├── teams/                    # Teams page route
│   │   ├── quote/                    # Quotes carousel route
│   │   ├── +layout.svelte            # Root layout component
│   │   ├── +layout.ts                # Root layout data loader
│   │   ├── +page.svelte              # Home page component
│   │   ├── +error.svelte             # Error boundary component
│   │   └── footer.svelte             # Global footer component
│   │
│   ├── lib/                          # Reusable library code
│   │   ├── components/               # Svelte UI components
│   │   │   ├── icons/                # Icon SVG components
│   │   │   ├── custom/               # Custom overrides (a, img, table for Markdown)
│   │   │   ├── navbar/               # Navigation components (narrow, wide, universal)
│   │   │   ├── Home.svelte           # Home page content component
│   │   │   ├── Button.svelte         # Reusable button component
│   │   │   ├── Card.svelte           # Card layout component
│   │   │   └── ...other components
│   │   │
│   │   ├── server/                   # Server-only utilities (can't run in browser)
│   │   │   ├── uk-postcode-to-mp.ts  # UK constituency/MP lookup
│   │   │   └── uk-mp-contact-status.ts # MP contact info verification
│   │   │
│   │   ├── stores/                   # Svelte stores for state management
│   │   │   └── nationalGroups.ts     # Writable store + loader for national groups
│   │   │
│   │   ├── data/                     # Static data files
│   │   │   └── uk-mps.json           # UK MPs database (107KB)
│   │   │
│   │   ├── clients/                  # External service clients
│   │   │   └── luma/                 # Luma calendar API wrapper
│   │   │       ├── types/            # Type definitions for Luma API
│   │   │       └── index.test.ts     # Luma client tests
│   │   │
│   │   ├── paraglide/                # Auto-generated i18n files (commit-ignored)
│   │   │   ├── messages.js           # Message catalog exports
│   │   │   ├── runtime.js            # Locale detection & message selection
│   │   │   ├── registry.js           # Locale registry
│   │   │   ├── server.js             # Server-side i18n middleware
│   │   │   └── messages/             # Language-specific message files
│   │   │
│   │   ├── generated/                # Auto-generated files (vite, build artifacts)
│   │   │
│   │   ├── airtable.ts               # Airtable API client (pagination, error handling)
│   │   ├── l10n.ts                   # Localization paths & utilities
│   │   ├── env.ts                    # Environment utilities (isDev, getEnvironment)
│   │   ├── config.ts                 # App configuration (site title, URLs)
│   │   ├── types.ts                  # TypeScript type definitions
│   │   ├── cloudinary.ts             # Cloudinary image client
│   │   ├── theme.ts                  # Theme configuration
│   │   ├── utils.ts                  # General utilities
│   │   └── redirects.ts              # URL redirect logic
│   │
│   ├── posts/                        # Markdown content files (blog, events)
│   │   └── *.md                      # Individual post files with YAML frontmatter
│   │
│   ├── assets/                       # Static assets (images, fonts)
│   │   ├── images/                   # Image files
│   │   ├── pfp/                      # Profile pictures
│   │   ├── protests/                 # Event photos
│   │   └── quote-bg/                 # Quote carousel backgrounds
│   │
│   ├── styles/                       # Global stylesheets
│   │
│   ├── hooks.server.ts               # Server middleware (Paraglide i18n, Deno fix)
│   ├── hooks.ts                      # Client-side hooks (minimal)
│   ├── app.d.ts                      # App-level TypeScript definitions
│   ├── app.html                      # HTML template (entry point)
│   └── mdsvex.svelte                 # Markdown layout wrapper
│
├── scripts/                          # Build & utility scripts
│   ├── l10n/                         # Localization scripts
│   ├── device-farm/                  # Device testing scripts
│   ├── open-letter/                  # Letter generation scripts
│   ├── clean.ts                      # Clean build artifacts
│   ├── create-pagefind-index.ts      # Search index generation
│   ├── l10ntamer.ts                  # Localization validation
│   └── ...other utility scripts
│
├── l10n-cage/                        # Localization content (not source code)
│   ├── md/                           # Translated markdown files by locale
│   └── json/                         # Translated message catalogs by locale
│
├── messages/                         # Source message files (English base)
│   └── en.json                       # English message catalog
│
├── project.inlang/                   # Paraglide i18n configuration
│   ├── settings.json                 # Active locale configuration
│   ├── settings.default.json         # Default all-locales configuration
│   └── default-settings.js           # Settings export for scripts
│
├── eslint/                           # ESLint configuration extensions
│
├── .github/                          # GitHub configuration
│   └── workflows/                    # CI/CD workflows
│
├── .planning/                        # GSD planning documents
│   └── codebase/                     # Codebase analysis documents
│
├── node_modules/                     # Dependencies (gitignored)
│
├── .svelte-kit/                      # SvelteKit build cache (gitignored)
│
├── dist/                             # Build output (gitignored)
│
├── svelte.config.js                  # SvelteKit configuration
├── vite.config.ts                    # Vite build configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Package dependencies & scripts
├── pnpm-lock.yaml                    # Locked dependency versions
├── .prettierrc                       # Prettier formatting config
├── eslint.config.js                  # ESLint configuration (flat config)
├── knip.config.ts                    # Unused import checker
└── .nvmrc                            # Node version specification
```

## Directory Purposes

**src/routes/**

- Purpose: Define all HTTP routes using SvelteKit file-based routing
- Contains: Page components (+page.svelte), loaders (+page.ts), layouts (+layout.svelte)
- Key pattern: Nested directories = URL segments. E.g., `routes/about/+page.svelte` → `/about`

**src/lib/components/**

- Purpose: Reusable Svelte UI components shared across pages
- Contains: Semantic components (Button, Card), layout components (Navbar), feature components (Home, Hero)
- Pattern: One component per file, PascalCase naming. Icons in subdirectory.

**src/lib/server/**

- Purpose: Server-only code (cannot be imported in browser)
- Contains: Database queries, secret API calls, file operations
- Pattern: Files must be imported with `$lib/server/*` (enforced by SvelteKit)

**src/lib/stores/**

- Purpose: Centralized reactive state management
- Contains: Svelte writable/readable stores with optional async loaders
- Pattern: Export store object + async load function. Example: `nationalGroups` store with `loadNationalGroups()` function

**src/lib/paraglide/**

- Purpose: Auto-generated i18n runtime (do not edit manually)
- Generated by: `pnpm l10n` build script via Paraglide CLI
- Contains: Message catalogs, locale registry, server middleware
- Gitignore: `.gitignore` in directory excludes runtime files

**src/posts/**

- Purpose: Author content as Markdown with YAML frontmatter
- Contains: Blog posts, event announcements, long-form content
- Pattern:
  - Filename → URL slug: `my-event.md` → `/my-event`
  - YAML frontmatter: `title`, `description`, `date`, `categories`, `author`
  - Svelte components can be embedded: `<Component />` in Markdown body

**l10n-cage/**

- Purpose: Hold all translations (organized by locale)
- Contains: Markdown translations in `md/[locale]/`, message catalogs in `json/[locale]/`
- Gitignored: Partially (build-generated, manually translated content)

**scripts/**

- Purpose: Build-time automation and utilities
- Contains: Localization processing, search index generation, artifact cleanup
- Run: Via npm scripts in package.json (e.g., `pnpm l10n`)

## Key File Locations

**Entry Points:**

- `src/app.html`: HTML template with `%sveltekit.head%`, `%sveltekit.body%`, `%lang%` placeholders
- `src/routes/+layout.svelte`: Root layout, renders on every page
- `src/hooks.server.ts`: Server middleware runs on every request

**Configuration:**

- `svelte.config.js`: SvelteKit setup (adapter, preprocessors, prerender config)
- `vite.config.ts`: Vite build settings (plugins, dev server, build optimization)
- `tsconfig.json`: TypeScript compiler options (strict mode, paths)
- `package.json`: Dependencies, scripts, package metadata

**Core Logic:**

- `src/lib/env.ts`: Environment detection utilities (`isDev()`, `getEnvironment()`)
- `src/lib/l10n.ts`: Localization configuration and locale filtering logic
- `src/lib/types.ts`: Shared type definitions (Post, Signatory, NationalGroup, Team)
- `src/lib/airtable.ts`: Airtable API client with pagination and fallback logic

**API Endpoints:**

- `src/routes/api/posts/+server.ts`: Aggregates Markdown + hardcoded page metadata
- `src/routes/api/national-groups/+server.ts`: Fetches from Airtable, transforms, returns JSON
- `src/routes/api/chat/+server.ts`: OpenAI ChatGPT integration
- `src/routes/api/uk-lookup-mp/+server.ts`: Postcode to MP lookup endpoint

**Data:**

- `src/lib/data/uk-mps.json`: UK MPs database (~107KB, loaded in browser)
- `messages/en.json`: Source message catalog for all languages

## Naming Conventions

**Files:**

- Routes: `+page.svelte`, `+layout.svelte`, `+server.ts` (SvelteKit convention)
- Components: PascalCase (e.g., `Button.svelte`, `Home.svelte`)
- Utilities: camelCase (e.g., `utils.ts`, `config.ts`)
- Tests: `*.test.ts` or `*.spec.ts` colocated with source
- Markdown: kebab-case (e.g., `my-post-title.md`)

**Directories:**

- Feature directories: kebab-case (e.g., `national-groups/`, `device-farm/`)
- Component subdirectories: PascalCase or feature-based (e.g., `icons/`, `custom/`, `navbar/`)

**Imports:**

- Path aliases: `$lib/*` (src/lib), `$api/*` (src/routes/api), `$assets/*` (src/assets)
- Relative imports: Use for same-level files, otherwise use aliases

## Where to Add New Code

**New Page/Route:**

1. Create directory: `src/routes/my-page/`
2. Add component: `src/routes/my-page/+page.svelte`
3. (Optional) Add loader: `src/routes/my-page/+page.ts`
4. Metadata for SEO: Export in `src/routes/my-page/meta.ts` or `src/routes/api/posts/+server.ts` hardcoded list

**New API Endpoint:**

1. Create directory: `src/routes/api/my-endpoint/`
2. Add handler: `src/routes/api/my-endpoint/+server.ts`
3. Export: `export async function GET()` or `POST()`, etc.
4. Return: `json(data)` or `error(code, message)`

**New Component:**

1. Create file: `src/lib/components/MyComponent.svelte`
2. Type props: `<script lang="ts">` with exported props
3. Style: `<style>` or `class:` directives
4. Import in routes/parent components: `import MyComponent from '$lib/components/MyComponent.svelte'`

**New Utility Function:**

- Shared helpers: `src/lib/utils.ts`
- Server-only logic: `src/lib/server/my-utility.ts`
- Type-specific utilities: Create new file `src/lib/my-domain.ts`

**New Store:**

1. Create file: `src/lib/stores/myStore.ts`
2. Export: `writable()` or `readable()` with type parameter
3. Add loader: Async function that calls API endpoint, updates store
4. Usage: `import { myStore, loadMyStore } from '$lib/stores/myStore'`

**New Markdown Post:**

1. Create file: `src/posts/my-post-title.md`
2. Add YAML frontmatter:
   ```yaml
   ---
   title: My Post Title
   description: Short description for SEO
   author: Name
   date: 2026-01-20
   categories: [category]
   ---
   ```
3. Write content: Markdown + embedded Svelte components
4. Accessible at: `/my-post-title` (slug = filename without extension)

## Special Directories

**.svelte-kit/**

- Purpose: SvelteKit-generated build artifacts (cache, types)
- Generated: Automatically during `pnpm dev` and `pnpm build`
- Committed: No (gitignored)
- Manual cleanup: `pnpm clean` or `rm -rf .svelte-kit/`

**dist/**

- Purpose: Build output (static HTML + assets)
- Generated: By `pnpm build` command
- Committed: No (gitignored)
- Deployment: This directory uploaded to Netlify

**node_modules/**

- Purpose: npm package dependencies
- Generated: By `pnpm install`
- Committed: No (gitignored)
- Lock file: `pnpm-lock.yaml` (commit this instead)

**.planning/codebase/**

- Purpose: GSD codebase analysis documents
- Manual: Created by GSD mappers, refined as codebase evolves
- Committed: Yes
- Read by: GSD planners/executors when creating implementation plans

**project.inlang/cache/**

- Purpose: Paraglide i18n build cache
- Generated: During `pnpm build` and `pnpm l10n`
- Committed: No (gitignored)

**l10n-cage/**

- Purpose: Extracted translations (source of truth for non-English content)
- Manual/Generated: Mix (manually created structure, translation tools fill content)
- Committed: Yes (contains human translations)
