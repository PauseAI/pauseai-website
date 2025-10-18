# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the PauseAI website (pauseai.info) - a SvelteKit-based website with automatic localization (l10n) support. It's deployed on Netlify and uses LLM-powered localization to generate locale-appropriate content across multiple languages.

## Essential Commands

### Development

```bash
pnpm dev              # Start development server at http://localhost:37572 (en-only mode by default)
pnpm build            # Build for production (runs l10n automatically based on env config)
pnpm preview          # Preview production build
```

### Code Quality

```bash
pnpm test             # Run Vitest test suite
pnpm lint             # Check code with knip and eslint
pnpm format           # Auto-fix code style with prettier
pnpm check            # Type-check SvelteKit code and build scripts
```

### L10n (Localization)

```bash
pnpm l10n             # Run l10n manually (mode determined by env)
pnpm l10n --dry-run   # Use cached translations only (no LLM calls)
pnpm l10n --verbose   # Show detailed debug output
pnpm l10n --force "*.md"  # Force retranslation of specific files
```

### Other

```bash
pnpm clean            # Clean build artifacts and caches
```

## Architecture

### SvelteKit Structure

- **Adapter**: `@sveltejs/adapter-netlify` with edge functions enabled
- **Routing**: File-based routing in `src/routes/`
  - `+page.svelte` - Page components
  - `+page.ts` - Page load functions
  - `+server.ts` - API endpoints
  - `+layout.svelte` - Layout components
  - `+layout.ts` - Layout load functions
- **Aliases**:
  - `$lib` → `src/lib`
  - `$assets` → `src/assets`
  - `$api` → `src/routes/api`
- **Port**: Development server runs on port 37572

### Content Management

**Markdown Content**: Blog posts and articles stored in `src/posts/` as `.md` files

- Uses mdsvex for markdown processing with custom components
- Frontmatter for metadata (title, author, date, description, image)
- Custom image component for automatic optimization

**Decap CMS**: Web interface at https://pauseai-cms.netlify.app/ for content editing

- Creates pull requests automatically
- Non-authorized users must fork the repository
- Articles go through Draft → In Review → Ready workflow

**Dynamic Pages**: Some pages (`/teams`, `/chat`, etc.) fetch data from Airtable API at runtime

### Localization System (L10n)

The l10n system is a sophisticated multi-mode translation pipeline:

#### L10n Cage Architecture

- **L10n Cage**: Git repository (https://github.com/PauseAI/paraglide) cloned locally as `l10n-cage/`
- **Purpose**: Cache Adopting Git Engine - caches LLM-generated translations to avoid duplicate API calls
- **Structure**:
  - `l10n-cage/json/` - Aggregated short messages (de.json, nl.json, etc.)
  - `l10n-cage/md/{locale}/` - Localized markdown pages per locale
- **Branch Strategy**: Feature branches in website repo create matching branches in cage

#### L10n Modes (automatically determined)

1. **en-only mode**: Only English configured (`PARAGLIDE_LOCALES=en` or undefined in dev)
   - No translations, maximum speed, default for local development
2. **dry-run mode**: Multiple locales but no API key or `--dry-run` flag
   - Uses cached translations only, no LLM calls
3. **perform mode**: Multiple locales + API key + proper branch
   - Generates new translations via LLM, commits to cage, pushes to remote

#### L10n Configuration

- **Default settings**: `project.inlang/default-settings.js` (source of truth)
- **Runtime settings**: `project.inlang/settings.json` (generated from defaults + env)
- **Locale selection**: `PARAGLIDE_LOCALES` env var
  - `en` - English only (dev default)
  - `all` - All available locales (CI default)
  - `en,nl,de` - Specific locales
  - `-fr,es` - All except specified
- **API Key**: `L10N_OPENROUTER_API_KEY` (required for perform mode)
- **Branch override**: `L10N_BRANCH` (optional, for testing different cage branches)

#### Branch Safety

- **Local dev**: Cannot write to main branch of l10n cage
- **CI/CD**: Can write to main for production deployments
- **Workaround**: Work on feature branches to create matching cage branches

#### L10n Files

- **Source messages**: `messages/en.json` (short UI strings)
- **Source markdown**: `src/posts/*.md` (articles/pages)
- **Translation script**: `scripts/l10n/run.ts` (main entry point)
- **Key modules**:
  - `scripts/l10n/mode.ts` - Mode determination
  - `scripts/l10n/branch-safety.ts` - Git branch safety checks
  - `scripts/l10n/llm-client.ts` - LLM API client with rate limiting
  - `scripts/l10n/prompts.ts` - Translation prompts
  - `scripts/l10n/heart.ts` - Core translation logic

### Image Handling

**Image Component**: `src/lib/components/Image.svelte`

- Automatic optimization for multiple formats (WebP, AVIF)
- Multiple resolutions for responsive images
- Source directory: `src/assets/images/`
- Path convention: Relative to `src/assets/images/`, starting with `/`

**Usage in Markdown**:

```markdown
![Description](/my-image.png)
![Description](/subdirectory/image.jpg)
```

**Usage in Svelte**:

```svelte
import Image from '$lib/components/Image.svelte'
<Image src="/my-image.png" alt="Description" />
```

### API Routes

API endpoints in `src/routes/api/`:

- `chat/+server.ts` - Claude AI chat interface
- `calendar/+server.ts` - Luma events calendar
- `geo/+server.ts` - Geo-location for event proximity
- `national-groups/+server.ts` - Community groups data
- `posts/+server.ts` - Blog posts listing
- `teams/+server.ts` - Team members from Airtable
- `signatories/+server.ts` - Statement signatories
- `uk-*` - UK-specific MP lookup and email functionality
- `write/+server.ts` - Newsletter signup
- `verify/+server.ts` - Email verification

**Airtable Integration**: `src/lib/airtable.ts`

- Fetches data from Airtable API with pagination
- Fallback data in development when API key not configured
- Helper function: `fetchAllPages<T>()`

### Environment Variables

**Development**: No `.env` required for basic development

- Copy `template.env` to `.env` for:
  - Multiple locales: `PARAGLIDE_LOCALES`
  - L10n generation: `L10N_OPENROUTER_API_KEY`
  - Dynamic content: Airtable keys, API keys
- Defaults ensure site works without env setup

**Isomorphic env handling**: `src/lib/env.ts`

- `getEnvironment()` - Works in both Node.js and browser
- `isDev()` - Determines if dev/test environment
- `getDevContext()` - Formatted context for logging

**Build-time**: `PARAGLIDE_LOCALES` is made available to browser via `import.meta.env`

### Redirects

**Server-side redirects**: `src/lib/redirects.ts`

- `REDIRECTS` object maps old paths to new paths
- 301 permanent redirects via `handleRedirects()` function
- Called from hooks to process before page load

### Build Process

**Build script**: `pnpm build` runs:

1. L10n generation (`tsx scripts/l10n/run`)
2. Vite build with `--emptyOutDir=false`
3. Post-build steps (run sequentially):
   - `_postbuild:pagefind` - Create search index
   - `_postbuild:exclude` - Configure edge function exclusions
   - `_postbuild:caching` - Set up caching headers
   - `_postbuild:l10ntamer` - L10n cleanup/validation

**Build optimizations** (vite.config.ts):

- Excludes unused locale directories from bundle
- Multi-threading with esbuild minification
- Disabled compressed size reporting for cleaner logs
- Sourcemaps in dev, disabled in production by default

### Testing

**Test runner**: Vitest

- Test files: `**/*.test.ts`
- L10n system has comprehensive tests in `scripts/l10n/*.test.ts`
- Luma client tests in `src/lib/clients/luma/index.test.ts`

### Deployment

**Platform**: Netlify

- Continuous deployment on push
- Status: https://app.netlify.com/sites/pauseai/deploys
- Edge functions enabled by default
- Build command: `pnpm run build`
- Publish directory: `build`

**PR Workflow**:

- PRs trigger l10n generation on matching cage branch
- Target PRs to `l10-preview` or similar branches for l10n preview (main is locked to en-only currently)
- Use "Squash and merge" when merging PRs (repository convention)

## Key Patterns and Conventions

### Paraglide Integration

**Middleware**: `src/hooks.server.ts` uses `paraglideMiddleware` for locale routing

- Intercepts requests and adds locale to URL path
- Transforms `%lang%` placeholder in HTML to actual locale

**Runtime**: Compiled from `project.inlang/settings.json`

- Import via: `import { locales, baseLocale } from '$lib/paraglide/runtime'`
- Access compiled messages via auto-generated functions

### Type Safety

**TypeScript**: Strict mode enabled

- `tsconfig.json` - SvelteKit code
- `scripts.tsconfig.json` - Build scripts
- Check both with `pnpm check`

### Markdown Processing

**mdsvex configuration** (svelte.config.js):

- Layout: `src/mdsvex.svelte`
- Plugins:
  - `remark-unwrap-images` - Remove paragraph wrappers
  - `remark-toc` - Generate table of contents
  - `remark-heading-id` - Custom heading IDs
  - `rehype-slug` - Heading slugs

**Custom components**: `src/lib/components/custom/`

- `a.svelte` - Custom link handling
- `img.svelte` - Image optimization
- `table.svelte` - Styled tables

### Component Organization

**Reusable components**: `src/lib/components/`

- Icons in `icons/` subdirectory
- Widget consent system in `widget-consent/`
- Simple TOC in `simple-toc/`
- Custom markdown renderers in `custom/`

### Styling

**Fonts**:

- Roboto Slab (300, 500, 700)
- Saira Condensed (700)

**CSS**:

- Global styles in `src/styles/styles.css`
- Print styles in `src/styles/print.css`
- Theme system in `src/lib/theme.ts`
- CSS custom properties for theming

## Development Notes

### Windows Development

Enable Developer Mode for symlink support:

1. Settings → Privacy & security → For developers
2. Toggle Developer Mode to On

### Node.js Version

Use version specified in `.nvmrc`. Run `nvm use` to enable for current shell session.

### Working with L10n

**Day-to-day content changes**: No need to run l10n locally - CI handles it automatically

1. Edit English content (CMS or files)
2. Create PR (triggers l10n on matching cage branch)
3. Preview l10n results in staging

**L10n system development**:

1. Work on feature branch
2. Set `L10N_OPENROUTER_API_KEY` in `.env`
3. Test with `--dry-run --verbose` first
4. Use `--force "pattern"` for selective retranslation

**Reusing l10n between branches**: Merge commits between cage branches

```bash
cd l10n-cage
git checkout my-current-branch
git merge other-feature-branch
cd ..
```

### Common Patterns

**Dynamic imports**: Used for code splitting (e.g., `/sayno` route loads `SelfieUX.svelte` dynamically)

**Locale detection**: Use `deLocalizeHref()` from `$lib/paraglide/runtime` to strip locale prefix from paths

**Page metadata**: PostMeta component handles SEO metadata per page

**Link handling**: Use `Link.svelte` component for external links (adds icon)

## Important Files

- `svelte.config.js` - SvelteKit configuration
- `vite.config.ts` - Vite build configuration
- `project.inlang/default-settings.js` - L10n source of truth
- `src/lib/l10n.ts` - L10n paths and utilities
- `scripts/l10n/run.ts` - L10n main entry point
- `src/hooks.server.ts` - Server-side middleware
- `src/routes/+layout.svelte` - Root layout
- `netlify.toml` - Netlify deployment config

## Additional Documentation

- `README.md` - Getting started, quick reference
- `L10N.md` - Comprehensive l10n system documentation
- `SELFIE_SETUP.md` - Selfie campaign setup
