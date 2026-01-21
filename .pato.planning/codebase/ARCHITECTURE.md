# Architecture

**Analysis Date:** 2026-01-20

## Pattern Overview

**Overall:** Server-Side Rendered (SSR) Full-Stack Web Application using SvelteKit with Static Site Generation (SSG)

**Key Characteristics:**

- SvelteKit-based framework with Vite build system
- Primarily prerendered static site with selective server-side endpoints
- Netlify Edge Functions for runtime features
- Multi-language support via Paraglide i18n
- Markdown-driven content system with Svelte component embedding
- Airtable-based data source for dynamic content (national groups, signatories, teams)

## Layers

**Presentation Layer:**

- Purpose: Render user interfaces and handle client-side interactions
- Location: `src/routes/`, `src/lib/components/`
- Contains: Svelte components, page templates, layout components
- Depends on: Routes layer, data stores, type definitions
- Used by: Browser clients, static prerender system

**Routes & Page Layer:**

- Purpose: Define URL structure and page entry points
- Location: `src/routes/`
- Contains: `+page.svelte`, `+page.ts` (page loaders), `+layout.svelte`, `+layout.ts`
- Depends on: Presentation layer, server functions
- Used by: Vite/SvelteKit router

**Server-Side Layer:**

- Purpose: Handle API endpoints, server-only logic, and external integrations
- Location: `src/routes/api/`, `src/lib/server/`, `src/hooks.server.ts`
- Contains: API endpoints (`+server.ts`), server utilities, data fetching
- Depends on: External APIs (Airtable, PostCodes.io, OpenAI)
- Used by: Client-side fetch requests, build-time data loading

**Data/Store Layer:**

- Purpose: Manage application state and data retrieval
- Location: `src/lib/stores/`, API client layer
- Contains: Svelte stores, data transformation functions
- Depends on: Server-side APIs
- Used by: Components, pages

**Integration Layer:**

- Purpose: Connect to external services
- Location: `src/lib/airtable.ts`, `src/lib/clients/luma/`, `src/lib/cloudinary.ts`
- Contains: API client wrappers, authentication handlers
- Depends on: Environment variables, external APIs
- Used by: Server endpoints, utility functions

**Localization Layer:**

- Purpose: Handle multi-language content and runtime locale management
- Location: `src/lib/paraglide/`, `src/lib/l10n.ts`, `l10n-cage/`
- Contains: Paraglide i18n runtime, language-specific content, message catalogs
- Depends on: Project configuration
- Used by: All presentation and layout components

## Data Flow

**Content Delivery Flow (SSG):**

1. Build time: Vite/SvelteKit prerender discovers all routes
2. `src/routes/+layout.ts` executes during prerender to load common data
3. Page-specific `+page.ts` loaders fetch data (potentially from API endpoints)
4. Markdown files in `src/posts/` are processed via mdsvex with Svelte components embedded
5. Static HTML generated and served from CDN

**Dynamic Data Flow (Runtime):**

1. Client page load triggers `src/routes/+layout.ts` → checks locale environment, validates configuration
2. Component calls `/api/*` endpoint via fetch
3. API endpoint (`src/routes/api/**/+server.ts`) executes on server/edge
4. Endpoint authenticates with external service (Airtable, postcodes.io, etc.)
5. Data transformed and returned as JSON
6. Component updates store or renders received data

**Server Hook Flow:**

1. Request arrives at `src/hooks.server.ts`
2. Paraglide i18n middleware extracts locale from URL/Accept-Language header
3. Locale-specific request prepared and passed to route handler
4. Response locale applied to `%lang%` placeholder in HTML

**State Management Flow:**

1. Stores initialized in `src/lib/stores/` (e.g., `nationalGroups.ts`)
2. Components call store load functions (async fetch + set)
3. Store subscribed components reactively update
4. Build-time: No runtime stores, data injected directly

## Key Abstractions

**API Endpoints:**

- Purpose: Expose server capabilities and external data as HTTP APIs
- Examples: `src/routes/api/national-groups/+server.ts`, `src/routes/api/posts/+server.ts`, `src/routes/api/chat/+server.ts`
- Pattern: Each endpoint is a directory containing `+server.ts` with GET/POST/PUT/DELETE exports

**Airtable Integration:**

- Purpose: Centralized data management for dynamic content
- Examples: `src/lib/airtable.ts` (base client), endpoints for national-groups, signatories, teams
- Pattern:
  - `src/lib/airtable.ts`: Generic fetch with fallback data for dev mode
  - API endpoints: Transform Airtable format to application types
  - Types: Separate `Airtable*` and application types for mapping

**Markdown Content:**

- Purpose: Author content as Markdown with embedded Svelte
- Examples: `src/posts/*.md` for blog posts/event announcements
- Pattern:
  - YAML frontmatter defines metadata (title, description, date, categories)
  - mdsvex processes Markdown + Svelte components
  - `src/routes/api/posts/+server.ts` aggregates Markdown metadata + hardcoded page metadata
  - Markdown compiled to route pages via `src/routes/[slug]/+page.svelte`

**Type System:**

- Purpose: Enforce runtime and compile-time safety across API boundaries
- Examples: `src/lib/types.ts` defines Post, NationalGroup, Team, Signatory types
- Pattern: Airtable schema types (AirtableNationalGroup) map to application types (NationalGroup)

**I18n (Paraglide):**

- Purpose: Runtime and build-time localization
- Examples: `src/lib/paraglide/messages.js`, `$lib/paraglide/messages` imports in components
- Pattern:
  - Generated message catalog at build-time
  - Runtime locale detection + message selection
  - Locale filtering via `PARAGLIDE_LOCALES` env var

## Entry Points

**Web Request Entry Point:**

- Location: `src/routes/+layout.svelte` and `src/routes/+layout.ts`
- Triggers: Every page load
- Responsibilities:
  - Load global data (user locale, alerts)
  - Inject layout structure (header, footer, navbar)
  - Validate locale environment consistency in dev mode

**API Entry Point:**

- Location: `src/routes/api/**/+server.ts`
- Triggers: Fetch requests from browser or build scripts
- Responsibilities:
  - Authenticate requests
  - Fetch/transform external data
  - Apply caching headers
  - Return JSON responses

**Build Entry Point:**

- Location: `svelte.config.js` with `prerender: { entries: [...] }`
- Triggers: `pnpm build`
- Responsibilities:
  - Discover all prerenderable routes
  - Execute loaders for static generation
  - Process Markdown with Svelte components
  - Generate locale-specific variants

**Server-Side Hook Entry Point:**

- Location: `src/hooks.server.ts`
- Triggers: Every server request (dev + edge functions)
- Responsibilities:
  - Extract and normalize locale from request
  - Middleware: Paraglide i18n setup
  - Pass locale to route handlers

## Error Handling

**Strategy:** Layered error handling with try-catch and status codes

**Patterns:**

- **API Errors:** Return `{ success: false, error: string }` or HTTP error status
  - Example: `src/lib/server/uk-postcode-to-mp.ts` returns `UKMPLookupError` type
- **Component Errors:** Try-catch in loaders, fallback data in stores
  - Example: `src/lib/stores/nationalGroups.ts` catches fetch errors, logs, returns empty array
- **Build Errors:** mdsvex and prerender warn vs. error via config
  - Example: `svelte.config.js` sets `handleHttpError: 'warn'` to allow dead links
- **Airtable Fallback:** Development mode uses `FALLBACK_*` data when API key missing
  - Example: `src/routes/api/national-groups/+server.ts` conditionally uses fallback

## Cross-Cutting Concerns

**Logging:** Console methods (error, warn, log, debug)

- Used in: Airtable client, Vite config, data loaders
- Pattern: Conditional logging based on `isDev()` context

**Validation:** Type-driven via TypeScript + format validation on input

- Used in: Airtable fetch, postcode lookup, email verification
- Pattern: Type narrowing (`typeof file === 'object'`), URL validation via regex

**Authentication:** Environment variables + external service tokens

- Used in: Airtable API key, OpenAI API key, Netlify config
- Pattern: `$env/static/private` imports (server-only) vs. dynamic env

**Caching:** HTTP cache headers + build-time prerender

- Used in: API endpoints set `cache-control` via `generateCacheControlRecord()`
- Pattern: Public endpoints 1-hour cache, private/dynamic content no-cache

**Internationalization:** Paraglide runtime + build-time compilation

- Used in: Every component via `$lib/paraglide/messages` imports
- Pattern: Locale auto-detection in hooks, manual override via `PARAGLIDE_LOCALES` env

**Environment Configuration:** Multi-source (process.env, import.meta.env, defaults)

- Used in: `src/lib/env.ts` provides `isDev()`, `getEnvironment()` utilities
- Pattern: Node.js/Browser detection, CI vs. DEV flag resolution
