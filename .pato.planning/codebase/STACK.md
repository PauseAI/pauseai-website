# Technology Stack

**Analysis Date:** 2026-01-20

## Languages

**Primary:**

- TypeScript 5.8 - Main application language for both source code and build scripts
- Svelte 4.2.20 - Frontend framework for UI components and pages
- Markdown (.md) - Content and documentation with mdsvex for static site generation

**Secondary:**

- JavaScript - Configuration files and utilities that don't require strict typing
- JSON - Configuration and localization data

## Runtime

**Environment:**

- Node.js 24.2.0 (from `.nvmrc`)
- Browser runtime (SvelteKit SSR-enabled)

**Package Manager:**

- pnpm 9.14.4 (specified in `package.json` packageManager field)
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**

- SvelteKit 2.49.5 - Full-stack web framework with server-side rendering and API routes
- Svelte 4.2.20 - Component framework for reactive UI
- Vite 5.4.21 - Build tool and dev server

**Preprocessing & Markdown:**

- mdsvex 0.11.2 - Markdown preprocessor for Svelte, converts `.md` files to components
- vite-plugin-svelte 3.1.2 - Vite plugin for Svelte support
- vite-plugin-lucide-preprocess 1.4.6 - Preprocess Lucide icons

**Deployment:**

- @sveltejs/adapter-netlify 5.2.4 - SvelteKit adapter for Netlify deployment with edge functions enabled
- @netlify/edge-functions 2.19.0 - Serverless edge function support

**Testing:**

- vitest 2.1.9 - Unit and integration test runner

**Build & Dev:**

- svelte-check 4.3.5 - Type checking for Svelte components
- tsx 4.21.0 - TypeScript execution for build scripts
- vite 5.4.21 - Fast build tool and dev server (port 37572)

## Key Dependencies

**Critical Infrastructure:**

- @anthropic-ai/sdk 0.39.0 - Anthropic Claude API client for AI-powered email generation
- airtable 0.12.2 - Airtable SDK for database access
- axios 1.13.2 - HTTP client for external API calls
- axios-retry 4.5.0 - Retry logic for failed HTTP requests

**UI & Visualization:**

- maplibre-gl 5.10.0 - Vector map library for geographic displays
- lucide-svelte 0.536.0 - Icon component library
- @glidejs/glide 3.6.2 - Carousel/slider component
- svelte-french-toast 1.2.0 - Toast notification library
- @number-flow/svelte 0.3.9 - Animated number transitions
- @pagefind/default-ui 1.4.0 - Search UI components
- html-to-image 1.11.13 - Client-side image generation

**Content Processing:**

- micromark 4.0.2 - Markdown tokenizer
- remark-toc 9.0.0 - Table of contents generation
- remark-unwrap-images 3.0.1 - Markdown image preprocessing
- remark-heading-id 1.0.1 - Auto-generate heading IDs
- rehype-slug 5.1.0 - Add slugs to headings
- svelte-markdown 0.4.1 - Markdown component renderer
- svelte-toc 0.5.9 - Table of contents component
- github-slugger 2.0.0 - URL-friendly slugs

**Internationalization & Localization:**

- @inlang/paraglide-js 2.9.0 - i18n framework with routing support
- paraglide-js runtime (auto-generated in `src/lib/paraglide/`)

**Utilities:**

- @remix-run/headers 0.12.0 - Header utilities
- @sveltejs/enhanced-img 0.3.10 - Image optimization
- escape-html 1.0.3 - HTML entity escaping
- clipboard-polyfill 4.1.1 - Clipboard API fallbacks
- snakecase-keys 8.1.0 - Object key transformation
- ua-parser-js 1.0.41 - User agent parsing
- remove-markdown 0.5.5 - Strip markdown formatting
- http-status-codes 2.3.0 - HTTP status code constants
- pagefind 1.4.0 - Static site search indexing
- p-queue 8.1.1 - Promise queue management

**Fonts:**

- @fontsource/roboto-slab 5.2.8 - Roboto Slab font
- @fontsource/saira-condensed 5.2.8 - Saira Condensed font

## Development & Linting

**Code Quality:**

- ESLint 9.39.2 - JavaScript/TypeScript linter with flat config
- @eslint/js 9.39.2 - Core ESLint rules
- @eslint/markdown 7.5.1 - Markdown file linting
- eslint-plugin-svelte 3.14.0 - Svelte-specific linting rules
- typescript-eslint 8.53.0 - TypeScript support for ESLint
- eslint-config-prettier 10.1.8 - Disable conflicting ESLint rules
- eslint-config-flat-gitignore 2.1.0 - Respect .gitignore in ESLint

**Code Formatting:**

- Prettier 3.8.0 - Code formatter
- prettier-plugin-svelte 3.4.1 - Svelte component formatting

**Dependency Management:**

- knip 5.81.0 - Unused dependency detector
- npm-run-all2 6.2.6 - Run npm scripts in parallel/sequence

**Git Hooks:**

- husky 9.1.7 - Git hook management
- lint-staged 15.5.2 - Run linters on staged files

**Build Scripts:**

- schema-dts 1.1.5 - TypeScript types from JSON Schema
- simple-git 3.30.0 - Git command execution
- globby 16.1.0 - Glob file matching
- minimatch 9.0.5 - Glob pattern matching
- minimist 1.2.8 - Command-line argument parsing
- dotenv 16.6.1 - Environment variable loading
- cross-env 7.0.3 - Cross-platform environment variables

## Configuration

**Environment:**

- `.env` file for local development (see `.env` template)
- `pnpm` configuration in `.npmrc`
- Node version specified in `.nvmrc` (24.2.0)

**Key Environment Variables:**

- `AIRTABLE_API_KEY` - Read-only access to Airtable bases
- `AIRTABLE_WRITE_API_KEY` - Write access to Airtable (email verification, MP contacts)
- `OPENAI_KEY` - OpenAI API for chat feature
- `ANTHROPIC_API_KEY_FOR_WRITE` - Anthropic Claude API for email generation
- `MAILERSEND_API_KEY` - Email sending via MailerSend
- `L10N_OPENROUTER_API_KEY` - OpenRouter API for localization generation
- `PARAGLIDE_LOCALES` - Comma-separated list of active locales (default: "en")
- `VITE_DISABLE_SOURCEMAPS` - Control sourcemap generation

**SvelteKit Configuration:**

- `tsconfig.json` - TypeScript strict mode enabled, path aliases configured
- `svelte.config.js` - mdsvex preprocessing, Netlify adapter with edge functions
- `vite.config.ts` - Custom build optimizations, locale handling, port 37572

**Build:**

- `netlify.toml` - Netlify deployment configuration
- Build command: `pnpm run build`
- Build output directory: `build/`
- Dev command: `pnpm dev`
- Dev port: 37572

## Platform Requirements

**Development:**

- Node.js 24.2.0
- pnpm 9.14.4
- TypeScript 5.8+
- Svelte 4.2+

**Production:**

- Netlify platform (adapter-netlify configured)
- Edge functions enabled on Netlify
- Environment variables configured in Netlify UI
- Build output: Pre-rendered static HTML + API routes

**Build Characteristics:**

- Static site generation with SvelteKit prerendering
- All locales configured in PARAGLIDE_LOCALES compiled ahead of time
- Unused locale directories excluded from build
- CSS code splitting enabled
- Sourcemaps conditionally generated (disabled in production by default)
- Minification via esbuild

---

_Stack analysis: 2026-01-20_
