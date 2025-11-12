# CLAUDE.md pauseai-l10n project context

This project concerns automatic localization of the PauseAI.info website (and later, possibly other text resources.)

The website is written in SvelteKit, is mostly static, served from Netlify. (A little dynamic content is fetched from AirTable.)

Do use LLM-targered documentation where appropriate. For example, at https://svelte.dev/docs/llms

Our key idea is that as of 2025 a mostly text website is best localized by LLMs.
Manual edits to generated content are to be avoided outside of emergency operational actions.
Instead, we "edit" content by adding to the prompt(s) that generate that localized content.

A second idea is that the generated content is itself stored in a Git-managed cache. This is for two reasons:

- avoid unnecessary token cost: don't run the same l10n request against the same LLM twice.
- for visibility: capture our exploration of l10n choices made throughout development

The top-level project `pauseai-l10n` is to become a dependency of the mainline pauseai-website.
For now it contains mostly documentation. Don't look for code there!

**IMPORTANT DIRECTORY STRUCTURE**: The actual pauseai-website codebase is located at:
`/home/anthony/repos/pauseai-l10n/notes/references/pauseai-website/`
NOT in the top-level pauseai-l10n directory. Always use the full path or cd to this subdirectory when working with website code.

Previously we were making changes to code that lived in notes/references/website-prototype,
but that work has now been merged to main. The website-prototype directory is kept for historical
reference but is no longer actively developed.

More generally the related current work is visible under notes/references, where

- `pauseai-website` contains the production deployed `pauseai-website` repository, which now includes all paraglide localization code.
- `repos_paraglide` contains a first cut of the Git-managed cache. `pause-l10n` will absorb it and code to manage it.
- Inactive `hide-website-prototype*` and `hide-website-mainline*` directories contain legacy versions of code that you should ignore.
- The `monorepos` contains source code when you want to dig into the inlang and paraglide frameworks, since reading the node distribution chunks is a bit of a pain.

The current implementation's l10n flow (now in the main branch):

- Git-based caching of translations, through OpenRouter + Llama 3.1
- Two-pass translation (initial + review)
- Separate aggregated short messages (en.json) and markdown for titled pages
- Preprocessing/postprocessing of markdown for proper handling
- Serial Git operations with queue

Key components in the main branch implementation:

- Environment-based configuration with PARAGLIDE_LOCALES env var
- is en in production website until we launch some localizations
- we can preview a production website with localization launched on branch l10-preview.
- Language switching UI with auto-detection in the header
- Default English-only mode for developer convenience
- Prerendering of all locale paths for static site generation

We have been trying to switch to having all localizations, including en, being rendered under locale-prefixed route,
with unlocalized routes always redirecting to a localized route.

We ran into 500 errors in edge functions while implementing that.

## Problem Statement

**Source: User reports**

- Code changes (implementing en prefix) cause 500 Internal Server Error responses for non-prerendered routes
- Issue occurs consistently in both production and local `netlify serve`
- Origin/main branch works correctly in production, including edge function routes like `/api/calendar`
- 500 error issue predate various debugging attempts (suppressed simple-git and js-render, moving from edge functions)

**What works vs what fails:**

- ✅ `edge: false (individual Node.js serverless render function or split functions) - promising in development
- ❌ `edge: true` (single 3MB edge render function) - ALL non-prerendered routes return 500
- cannot test `edge: true, split: true` because Netlify doesn't allow this combination.

### Workaround Applied

- **Disabled:** Edge function postbuild scripts (`exclude-from-edge-function.ts`, `opt-in-to-caching.ts`)
- **Status:** All API routes functional, locale redirects working (with some browser vs curl differences)

### Root Cause: Unknown but Isolated

**What we DON'T know:** Whether the issue is:

- Single large function vs multiple small functions (architectural difference / function size)
- Deno vs Node.js compatibility issues

### Investigation Methodology Notes

**For future Claude instances:**

1. **Read appropriate docs first** - Use https://svelte.dev/docs/kit/llms-small.txt for context-limited situations
2. **Don't overstate conclusions** - Stick to what's actually proven vs hypotheses
3. **Test minimal cases** - Created simple API endpoints to isolate from route complexity
4. **Understand prerendering** - Routes get prerendered when called by prerenderable pages (crawling behavior)
5. **Check edge function scripts** - `scripts/exclude-from-edge-function.ts` and `scripts/opt-in-to-caching.ts` fail when `edge: false`

### Server-Side Locale Management

**Note:** The `setLocale` call in `src/routes/+layout.ts` (lines 23-25) appears redundant and should be removed:

- The `paraglideMiddleware` in `hooks.server.ts` already handles locale detection and sets it via AsyncLocalStorage
- The +layout.ts runs after middleware, so its setLocale call likely has no effect (or worse, could interfere with edge function locale state)
- The middleware uses proper server-side context isolation; the +layout.ts approach risks state pollution

### Next Steps for Resolution

1. **Determine if edge functions are required** for production performance
2. **If needed:** Investigate specific edge function failure modes
3. **Consider:** Manual exclusion patterns like `/pagefind/*` for problematic routes
   **Source: WebSearch of Netlify support forums and GitHub issues**

- Documented issues with Netlify CLI edge functions and Deno v1.45.0+
- "TypeScript files are not supported in npm packages" compilation errors
- Syntax errors during edge function bundling can cause 500 responses
- Node.js vs Deno API compatibility issues affect edge function execution

## General pauseai-l10n Development Guidelines - brewed by Claude on first run

**Formatting:**

- No semicolons; use tabs for indentation; Single quotes; 100 character line width; No trailing commas
- if you see deviations, stop and let me know

**TypeScript:**

- Strict type checking enabled
- ES2020 target with CommonJS modules

**Imports:**

- Use ES module syntax with esModuleInterop

## Key Architectural Decisions

1. Cache Structure
   - Moving from translation caching to LLM request caching
   - Store full context (source, prompt, model, result)
   - Simpler validation approach vs complex preprocessing
   - Git-based storage with clean data model
   - Focus on auditability and reproducibility

2. Translation Strategy
   - Trust capable models (GPT-4/Claude) more
   - Reduce preprocessing/postprocessing complexity
   - Opt-in validation for special cases
   - Whole-page translation approach preferred
   - Prompt engineering over code complexity

3. Project Organization
   - Independent repository (vs monorepo)
   - TypeScript-based implementation
   - Build-time integration with pauseai-website
   - Cache as version-controlled translation history

## Some detail of how building and locale overrides work

Locally in development PARAGLIDE_LOCALES effectively defaults to just "en". A specific choice can be made in the .env file. (In production, the default is to all locales, but again environment variables may be defined to override that. We might do this when first exposing our localizable website in production - we'd like individuals to assess previews before putting the first translations live.)

Due to wanting to implement overrides, our default settings are defined as a JSON object in project.inlang/default-settings.js. Certain vite targets use inlang-settings.ts to create what the paraglide sveltekit plugin actually expects as source for building and running - a static project.inlang/settings.json file - and get paraglide to compile this into the code that manages locales at runtime (it builds src/lib/paraglide/runtime.js) We copy default-settings.js to a browser accessible file too, so that a running developer server can compare the current runtime against defaults and overrides and tell the developer when the server needs restarted.)

I suggest reading pnpm targets at the top of packages.json, and the default-settings.js - but leave other files uninspected until necessary.

## Implementation Plan

0. ✅ ~~COMPLETED~~ Fixes to make it reasonable to push and deploy to the prototype/paraglide branch:
   - ✅ Mend anything broken about build targets in production - by running them on developer machine
   - ✅ Support translation development on some developer machine

1. Current state: Using PARAGLIDE_LOCALES=en in CI/CD deployment to keep locales unlaunched
   - 🔄 Fix remaining issues before enabling non-English locales:
     - Isolate cache repositories by branch (prevent dev/preview from writing to production cache)
     - Localize non-static resources that still only show English content:
       - Search results
       - All pages list
       - RSS feed
       - Teams/People pages
       - Email builder
       - Write functionality
   - Create user-facing documentation explaining the l10n status:
     - How users can help more locales become enabled
     - How to report translation problems
     - Explanation of our LLM usage for translations (ethical considerations)
   - Validate some locales asap to realize value in production website
     - Test with native speakers
     - We may need better models for sufficiently good translations, if so suggest switch cache first
     - Otherwise launch some locales in production!
   - Supporting other models:
     - Switch to LLM request caching
     - Implement a comparison UI for dev/preview validation
     - Once verified, remove comparison(?) and go forward with cached requests

2. Medium Term (take dependency on pauseai-l10n and move relevant code there)
   - Complete transition to new cache
   - Simplify markdown handling
   - Streamline validation
   - Document new architecture

3. Long Term
   - Optimize model selection
   - Enhance prompt engineering
   - Scale to more languages
   - Consider community feedback system

## LINK LOCALIZATION IMPLEMENTATION (January 26, 2025)

### Problem Statement

Localized pages (e.g., `/de/faq`, `/nl/proposal`) contain unlocalized internal links (e.g., `/proposal`, `/learn`) that should be localized to match the page's locale (e.g., `/de/proposal`, `/nl/learn`).

### Current State (Baseline Metrics)

**Initial Audit Results** (via `scripts/audit-unlocalized-links.ts`):

- **🚨 3,644 unlocalized links FROM localized pages** - require fixing
- **✅ 1,135 unlocalized links FROM unlocalized pages** - expected behavior
- **Top offenders**: `/proposal` (349×), `/xrisk` (321×), `/communities` (300×), `/action` (299×), `/join` (296×)
- **Impact**: 356 HTML files + 152 JS chunks affected

### First Round of Solution Implementated

**File**: `src/lib/components/custom/a.svelte`  
**Method**: Use existing `localizeHref()` function from `$lib/paraglide/runtime`

**Implementation Plan**:

1. ✅ Modify custom `a` component to automatically localize internal absolute links (`/foo` → `/de/foo`)
2. ✅ Use `localizeHref()` which correctly handles language switchers (prevents double-prefixing)
3. ✅ Re-run audit to track progress (target: reduce 3,644 → near 0)
4. ✅ Switched footer to use Link

**Infrastructure Ready**:

- ✅ Paraglide `localizeHref()` function handles all edge cases
- ✅ Custom `a` component already used throughout markdown via mdsvex
- ✅ Audit tooling implemented and tested for progress tracking
- ✅ Affects both prerendered HTML and JS chunks automatically

See `/home/anthony/repos/pauseai-l10n/LINK_LOCALIZATION_PLAN.4.md` for complete technical details.

## L10n Workflow - Branch Safety & Mode System (Updated January 2025)

### Current Implementation

We have a clean branch-based safety system with comprehensive mode determination:

#### 1. Mode System

The `Mode` class determines operation mode based on three "breeds" (`L10nBreed`):

- **en-only**: No translation needed (single locale configured)
- **dry-run**: Read cache only, no LLM calls (missing/invalid API key OR --dry-run flag)
- **perform**: Full translation with LLM calls and cache writes

The mode provides:

- Clear announcement via `mode.announce()`
- Centralized CI detection via `mode.isCI`
- Branch information and safety validation
- Comprehensive unit tests

#### 2. Branch-Based Safety

- Dynamic branch detection: checks `L10N_BRANCH` env → CI variables → current Git branch
- **Main branch protection**: Local development cannot write to main branch
- **CI exception**: CI/CD environments can write to main for production deploys
- Automatic branch creation and upstream tracking in Git operations

#### 3. L10n Terminology Migration ✅

- **Environment variables**: Now use `L10N_OPENROUTER_API_KEY` and `L10N_BRANCH`
- **Cache location**: Moved to `l10n-cage` (CAGE = Cache As Git Environment)
- **Core files renamed**: `run.ts` (main), `heart.ts` (processing logic)
- **Git username**: `L10nKeeper` manages the lion cage
- **Module organization**: Branch safety functions extracted to dedicated module
- **Function naming**: Clear distinction between website and cage operations

### Key Documents

- **Current Plan**: `/home/anthony/repos/pauseai-l10n/L10N_BRANCH_SAFETY_PLAN_v2.md` - Updated plan with completed work and next steps
- **Original Plan**: `/home/anthony/repos/pauseai-l10n/L10N_BRANCH_SAFETY_PLAN.md` - Historical reference
- **Session Summary**: `/home/anthony/repos/pauseai-l10n/notes/summary/20250602T00.branch_safety_and_mode_system.summary.md`
- **Debug Plan**: `/home/anthony/repos/pauseai-l10n/PREFIX_ALL_LOCALES_DEBUG_PLAN.md` - Systematic approach to diagnose prefix-all-locales 500 errors

### Usage Examples

```bash
# Dry-run mode (no API key or invalid key)
TRANSLATION_OPENROUTER_API_KEY="short" pnpm l10n

# Explicit dry-run with valid API key
pnpm l10n --dry-run

# Verbose dry-run to see file details
pnpm l10n --dry-run --verbose

# Force retranslation of specific files (currently hardcoded list)
pnpm l10n --force

# Normal translation (requires valid API key and non-main branch)
pnpm l10n
```

### Known Issues ✅ (Resolved)

- ✅ **en.json symlink error**: Fixed in clean script
- ✅ **Upstream tracking**: Automatic upstream setup implemented
- ✅ **pnpm targets**: Simplified to use CLI flags instead of multiple scripts
- ✅ **Module organization**: Branch safety functions extracted to dedicated module

## Current Investigation Status (January 2025)

**CONTEXT**: We have been working on pauseai-website branches originally created to explore consistently using locale prefixes (for en as well as existing locales). This uncovered 500 errors in edge functions. The investigation was paused to complete essential l10n infrastructure work.

**MAJOR PROGRESS COMPLETED**:
✅ Link localization implementation (custom `a.svelte` component)  
✅ Branch safety & mode system implementation  
✅ L10n terminology migration (`translation` → `l10n`, `cage` terminology)  
✅ Force mode with glob pattern support  
✅ Critical security fix: CI no longer silently dry-runs with invalid API keys  
✅ Comprehensive testing suite (branch safety, mode, force functionality)  
✅ Fixed runtime errors in l10n pipeline (`params.locateTarget` interface)  
✅ Git tracking and authentication fixes (SSH auto-switch, upstream setup)
✅ Bootstrap and path alignment fixes (auto-regenerate settings, l10n-cage paths)
✅ Clean safety improvements (en.json symlink handling)
✅ **Atomic commit implementation**: Clean modular architecture with 3 atomic commits
✅ **Module organization**: Branch safety functions extracted to dedicated module
✅ **Function renaming**: Clear distinction between website and cage operations
✅ **Test infrastructure**: All tests converted to vitest with comprehensive coverage

**CURRENT STATUS**: L10n infrastructure COMPLETE and ready for review

- ✅ End-to-end l10n workflow verified and tested
- ✅ Clean atomic commits in PR #366 (marked ready for review)
- ✅ All technical debt resolved (no duplicated functions, clear module boundaries)
- ✅ Comprehensive test suite with 46 passing tests across 4 test files
- ✅ Git operations handle new branches with automatic upstream setup
- ✅ Authentication works seamlessly (SSH auto-switch)
- ✅ Comprehensive l10n developer documentation written
- ✅ **Production preview**: Infrastructure verified working with edge functions enabled

**CURRENT CONFIGURATION** (PR #366):

- **Routing strategy**: Standard prefix (no en-prefix) - working correctly
- **Edge functions**: `edge: true` - functioning properly with current codebase
- **Locales**: English-only in production (`PARAGLIDE_LOCALES=en`)
- **Link localization**: Active and working via custom `a.svelte` component

**CURRENT STATUS** (Updated 2025-06-16):

- ✅ **PR #366**: L10n infrastructure complete, TypeScript CI issues resolved, ready for merge
- 🔄 **Awaiting review**: Documentation and code ready, allowing time for reviewer feedback
- ✅ **500 Error Investigation COMPLETE**: Root cause identified in PR #325
  - **Issue**: Both edge functions AND serverless functions fail with `prefix-all-locales` strategy
  - **Investigation branch**: `investigate/500s` with minimal reproduction case
  - **Documentation**: `/notes/summary/20250616T14.edge_vs_serverless_500_investigation.summary.md`
  - **Conclusion**: Adapter prerender filtering approach is fundamentally incompatible with Netlify functions
- 📋 **Next priorities**: Implement proper `prefix-all-locales` solution, then launch additional locales

**LATER REFINEMENTS** (not blocking):

- Mode factory pattern for better testing
- Branch maintenance strategy for old PR branches

## Quick Start for New Claude Instances

**WORKING DIRECTORY**: Always work in `/home/anthony/repos/pauseai-l10n/notes/references/pauseai-website/`

**VERIFY CURRENT STATE**:

```bash
cd /home/anthony/repos/pauseai-l10n/notes/references/pauseai-website/
git log --oneline -3  # Should show 3 recent atomic commits
pnpm test run         # Should show 46 passing tests
pnpm l10n --dry-run   # Should work without errors
```

**KEY NEW FILES TO UNDERSTAND**:

- `scripts/l10n/branch-safety.ts` - Branch detection and safety validation
- `scripts/l10n/mode.ts` - L10n mode system (en-only/dry-run/perform)
- `scripts/l10n/force.ts` - Force mode with glob patterns
- `scripts/l10n/heart.ts` - Core l10n processing logic
- `scripts/l10n/run.ts` - Main entry point

**IMMEDIATE TASKS**:

1. Write comprehensive l10n developer documentation
2. Prepare atomic commits for merge to main
3. Return to en-prefix/500 error investigation

**📖 DETAILED CONTEXT**: Read `/home/anthony/repos/pauseai-l10n/L10N_BRANCH_SAFETY_PLAN_v2.md` for complete implementation details.

## Maintaining documentation

As per previous general notes. Please use .notes/summary and .notes/personal (via the local symlink) to store summaries in the top-level pauseai-l10n project.

## How you can be most helpful as a coding assistant

As pre previous general notes. We are a CODING CENTAUR who acts once we've agreed on the plan.
