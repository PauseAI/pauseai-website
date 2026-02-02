# Codebase Concerns

**Analysis Date:** 2026-01-20

## Tech Debt

**Write API Endpoint Excluded from Linting:**

- Issue: The `/write` route handlers (`src/routes/api/write/+server.ts` and `src/routes/write`) are globally ignored by ESLint configuration, allowing them to bypass quality checks
- Files: `eslint.config.js` (lines 111-114), `src/routes/api/write/+server.ts`
- Impact: Linting rules for TypeScript, Svelte, and other standards are not enforced in this 522-line critical API endpoint that handles Claude AI integration for email generation
- Fix approach: Remove the eslint ignore directives and resolve any linting errors in the write endpoint. The TODO comment suggests this was temporary.

**Large Monolithic API Endpoint:**

- Issue: The `/write` API handler (`src/routes/api/write/+server.ts`) is 522 lines with multiple responsibilities: state management, step orchestration, Claude prompting, and response formatting all in a single file
- Files: `src/routes/api/write/+server.ts`
- Impact: Difficult to test, maintain, and modify. Complex state transitions and step handlers could introduce bugs. Hard to reuse prompt engineering logic elsewhere
- Fix approach: Extract into smaller modules: separate concerns like state management (`writeState.ts`), step handlers (`steps/`), prompt definitions (`prompts.ts`), and response formatting (`formatter.ts`)

**Overly Permissive `any` Type Usage:**

- Issue: ESLint rule `@typescript-eslint/no-explicit-any` is disabled in critical API endpoint with explicit directive `/* eslint-disable @typescript-eslint/no-explicit-any */`
- Files: `src/routes/api/about/+server.ts` (line 1)
- Impact: Function `recordToPerson` uses `any` type without type checking, making it impossible to catch data structure mismatches from Airtable at compile time
- Fix approach: Define proper TypeScript types for Airtable record structure. Create type guards or use zod/validation library to parse API responses

**Raw API Key Hardcoded in Public Code:**

- Issue: Cloudinary API_KEY is hardcoded with a default value in source code
- Files: `src/lib/cloudinary.ts` (line 6): `const API_KEY = env.CLOUDINARY_API_KEY || '779717836612829'`
- Impact: Public API key exposed in version control and production builds, though this appears to be a public read-only key, it's a security anti-pattern
- Fix approach: Remove hardcoded fallback. Always require explicit env var configuration. Verify if this key is truly public-read-only in Cloudinary settings

**Inconsistent Error Handling Patterns:**

- Issue: Error handling varies across files - some use try-catch with typed errors, others catch `unknown` and cast, some throw uncaught errors
- Files: `src/routes/contact-us/+page.server.ts` (line 101: `catch (error: unknown)`), `src/lib/airtable.ts` (line 65), `src/routes/api/write/+server.ts` (line 514)
- Impact: Inconsistent error propagation and user feedback. Some endpoints may leak internal error details to clients
- Fix approach: Create utility functions for standardized error handling and HTTP response formatting

**Rate Limiting is Per-Instance:**

- Issue: Rate limiting in `src/routes/api/uk-send-mp-email/+server.ts` uses in-memory array that resets on server restart
- Files: `src/routes/api/uk-send-mp-email/+server.ts` (lines 9-31)
- Impact: Rate limits are ineffective in multi-instance deployments (e.g., on Netlify with multiple edge functions). An attacker could bypass limits by distributing requests across instances
- Fix approach: Implement distributed rate limiting using Redis or Netlify Durable Objects

**Unenforced Environment Configuration:**

- Issue: Many critical API keys are checked but with fallback values or optional initialization rather than explicit validation at startup
- Files: `src/routes/api/write/+server.ts` (line 6), `src/lib/cloudinary.ts` (line 6-7), `src/routes/api/uk-send-mp-email/+server.ts` (line 43)
- Impact: Misconfigured deployments may silently degrade (e.g., write endpoint returns degraded mode without prominent logging). Production bugs could be undetected
- Fix approach: Create initialization validation script that runs on server startup and fails fast if critical env vars are missing

---

## Known Bugs

**Locale State Management Debug Function:**

- Issue: `debugLocaleState()` function is called on every component mount with console.log output
- Files: `src/lib/components/LanguageSwitcher.svelte` (lines 66-80)
- Symptoms: Browser console filled with repeated locale debug logs on every page with language switcher
- Trigger: Loading any page with LanguageSwitcher component
- Workaround: Filter console logs in browser dev tools or comment out `debugLocaleState()` calls

**Camera Permission Edge Case in Netlify Deno Runtime:**

- Issue: Complex workaround for Netlify's partial window stub in Deno edge functions
- Files: `src/hooks.server.ts` (lines 1-16), notes referenced but not found in repo
- Symptoms: Paraglide-js library incompatibility with Netlify's Deno 2.3.1 partial window object
- Trigger: Running on Netlify edge functions
- Workaround: Global window deletion is already implemented, but relies on undocumented Netlify Deno behavior

**Empty Return Values without Error Context:**

- Issue: Several utility functions return empty containers (null, [], {}) without indicating why or what state triggered the return
- Files: `src/lib/env.ts` (line 18), `src/lib/stores/nationalGroups.ts`, `src/routes/sayno/+page.ts`
- Symptoms: Calling code can't distinguish between "no data" and "error occurred". Silent failures possible in data loading
- Trigger: Environment detection failures, missing store initialization
- Workaround: Add conditional logging when empty values are returned

---

## Security Considerations

**HTML Injection in Email Templates:**

- Risk: Contact form email content is interpolated into HTML strings without sanitization
- Files: `src/routes/contact-us/+page.server.ts` (lines 33-43)
- Current mitigation: Only newline-to-BR conversion applied; user email and name fields directly embedded
- Recommendations:
  - Use templating engine (e.g., mjml for email) instead of string concatenation
  - Validate and sanitize all user inputs before embedding in HTML
  - Consider using a library like `escape-html` (already in dependencies but not used here)

**Direct Airtable Formula Construction:**

- Risk: Although there's a whitelist check, the `filterByFormula` parameter construction could be vulnerable if whitelist bypass is possible
- Files: `src/routes/api/uk-send-mp-email/+server.ts` (lines 92-93), comment on line 81 explicitly warns about this
- Current mitigation: Whitelist validation of recipient emails before formula creation
- Recommendations:
  - Never construct Airtable formulas dynamically. Use Airtable API's direct record ID lookups instead
  - Consider database-level access controls rather than formula-based filtering

**Sensitive Data in Error Messages:**

- Risk: Error details from external APIs (MailerSend, Airtable) are logged and potentially exposed to users
- Files: `src/routes/contact-us/+page.server.ts` (line 90), `src/routes/api/about/+server.ts`
- Current mitigation: Generic error messages returned to client, but server logs contain full error details
- Recommendations:
  - Implement structured logging with error ID correlation
  - Never expose API response bodies to frontend
  - Log API errors separately from user-facing responses

**Insufficient Input Validation:**

- Risk: Email form validates field presence but not format or length constraints
- Files: `src/routes/contact-us/+page.server.ts` (lines 116-130, validation only checks `toString()`)
- Current mitigation: MailerSend API rejects invalid emails, but this is last-line defense
- Recommendations:
  - Add email format validation (regex or library like `email-validator`)
  - Implement length limits on all text fields
  - Add rate limiting at form submission level (per IP or user session)

**Cloudinary Signature Generation:**

- Risk: Using Web Crypto API for SHA1 without validation of the signature computation
- Files: `src/lib/cloudinary.ts` (lines 57-59)
- Current mitigation: Signature is required for Cloudinary API acceptance
- Recommendations:
  - Add unit tests to verify signature generation against known test vectors
  - Consider if SHA1 is still considered secure for this use case (Cloudinary best practices)

---

## Performance Bottlenecks

**In-Memory Cache without Size Limits:**

- Problem: `System_Prompts` object in write API grows during request processing, stored in memory
- Files: `src/routes/api/write/+server.ts` (lines 51, 340, 349)
- Cause: Prompts are cached as global object properties without cleanup or size limits
- Improvement path: Move prompts to constants file or use immutable cache with TTL/memory limits

**Airtable Pagination All at Once:**

- Problem: `fetchAllPages()` loads ALL records from Airtable at once without streaming or pagination to client
- Files: `src/lib/airtable.ts` (line 63: `table.select(queryParams).all()`)
- Cause: Using Airtable SDK's `.all()` method instead of streaming
- Improvement path: Implement pagination at the API endpoint level, return paginated results to client with offset/limit

**Cloudinary API Multiple Calls for Metadata:**

- Problem: Selfie store and photo management may make multiple API calls for same resource
- Files: `src/routes/sayno/selfieStore.ts`, usage patterns unclear
- Cause: No request deduplication or caching strategy visible
- Improvement path: Implement request deduplication with AbortController, cache API responses with TTL

**No Build-Time Content Generation:**

- Problem: Heavy build process (6 postbuild steps) runs sequentially, some may be blocking
- Files: `package.json` (lines 11-16)
- Cause: Locale generation, pagefind indexing, and optimization steps all run at build time
- Improvement path: Parallelize build steps using `run-p` instead of `run-s`, use conditional execution for optional steps

---

## Fragile Areas

**Client State Serialization:**

- Files: `src/routes/api/write/+server.ts` (lines 327: `JSON.stringify(state)`)
- Why fragile: Complete state machine serialized to JSON token and passed back to client. Any state shape change breaks existing in-progress requests
- Safe modification:
  - Add migration logic for state token parsing to handle schema changes
  - Version the state token format
  - Add server-side state storage instead of client-side serialization
- Test coverage: No tests visible for state serialization/deserialization or step transitions

**Svelte Store Subscription Cleanup:**

- Files: `src/routes/sayno/selfieStore.ts` (multiple writable stores), `src/lib/components/LanguageSwitcher.svelte`
- Why fragile: Multiple writable stores used across components with potential subscription leaks if components don't cleanup properly
- Safe modification:
  - Audit all store subscriptions for cleanup in `onDestroy`
  - Consider using derived stores for computed values instead of imperative updates
- Test coverage: No unit tests for store behavior

**Browser API Detection:**

- Files: `src/routes/sayno/selfieStore.ts` (lines 62-97: camera permission check), `src/lib/collagen.ts` (localStorage check)
- Why fragile: Multiple checks for APIs (`navigator.permissions`, `localStorage`, `window.location`) with various fallbacks and error handling, but inconsistent patterns
- Safe modification:
  - Create feature detection utility module with consistent error handling
  - Add logging for feature detection failures in production
- Test coverage: No browser API tests

**Markdown Rendering Without Sanitization:**

- Files: Multiple markdown files in `src/posts/` rendered through `mdsvex` and custom components
- Why fragile: If untrusted content can be added to markdown files, HTML/script injection possible through markdown
- Safe modification:
  - Audit markdown processing pipeline (mdsvex, remark plugins)
  - Add sanitization step before rendering (e.g., `DOMPurify`)
  - Restrict markdown syntax allowed (no HTML tags)
- Test coverage: No security tests for markdown rendering

**Cloudinary Widget Initialization:**

- Files: `src/routes/sayno/selfieStore.ts` (lines 32-37)
- Why fragile: CloudinaryWidget interface is minimal with only `open()` and `destroy()`. If Cloudinary changes widget API, code will silently fail
- Safe modification:
  - Version Cloudinary SDK and test on major version changes
  - Add error boundaries around widget initialization
  - Log widget initialization failures
- Test coverage: No tests for Cloudinary integration

---

## Scaling Limits

**Rate Limiting Per Server Instance:**

- Current capacity: 50 requests per minute per instance
- Limit: In multi-instance deployment (Netlify edge functions), each instance gets 50 limit = 50 \* N total capacity
- Scaling path:
  - Move to distributed rate limiting (Redis, Netlify Durable Objects)
  - Implement token bucket algorithm with backend state
  - Track rate limits per-user or per-IP across all instances

**Airtable API Rate Limits:**

- Current capacity: Airtable tier limits (typically 5 req/sec for standard)
- Limit: Cacheless requests hit limit quickly under load; `.all()` method fetches all records at once
- Scaling path:
  - Add Redis caching with short TTL (5-10 minutes for people/teams data)
  - Implement pagination at API level
  - Use Airtable webhooks for cache invalidation instead of polling

**Build Process Complexity:**

- Current capacity: Build runs with 6 sequential postbuild steps; locale generation may block on large codebases
- Limit: Build time increases with content volume; each postbuild step dependent on previous output
- Scaling path:
  - Parallelize independent build steps
  - Separate critical path from optional steps
  - Use incremental builds or cache build artifacts

**In-Memory State for Streaming Requests:**

- Current capacity: All Claude requests maintain state in memory until completion (up to 6 steps)
- Limit: Concurrent requests × state size = memory pressure; server restart loses all in-flight requests
- Scaling path:
  - Move state to persistent session store (Redis, database)
  - Implement request timeout and cleanup
  - Add graceful shutdown handler for in-flight requests

---

## Dependencies at Risk

**Anthropic SDK Version Pinning:**

- Risk: `@anthropic-ai/sdk@^0.39.0` uses caret versioning, minor/patch versions auto-update. Claude model names may change
- Files: `package.json` (line 75)
- Impact: Model string `'claude-3-7-sonnet-20250219'` in `src/routes/api/write/+server.ts` could become invalid if SDK updates deprecate it
- Migration plan:
  - Pin SDK to exact version or use >= with tested range
  - Add integration tests that verify model availability
  - Monitor SDK changelog for breaking changes

**Airtable SDK Dependency:**

- Risk: Airtable SDK is relatively lightweight but has optional dependency management unclear
- Files: `package.json` (line 85)
- Impact: If Airtable API changes, SDK may have delayed updates
- Migration plan:
  - Consider REST API client instead of SDK for tighter control
  - Test major version upgrades in staging environment
  - Implement API versioning in requests

**Cloudinary Signing Algorithm:**

- Risk: Using SHA1 for signature generation, which may be deprecated by Cloudinary
- Files: `src/lib/cloudinary.ts` (line 10: `crypto.subtle.digest('SHA-1', data)`)
- Impact: Future Cloudinary API changes could require SHA256 or other algorithms
- Migration plan:
  - Monitor Cloudinary API announcements
  - Add abstraction layer for signature algorithm
  - Include SHA256 alternative in codebase for forward compatibility

---

## Missing Critical Features

**No Request Timeout Management:**

- Problem: Claude API requests in write endpoint have no timeout mechanism
- Blocks: Long-running requests could hang indefinitely; no timeout headers set on fetch calls
- Recommendations:
  - Add AbortController with timeout for all external API calls
  - Set reasonable timeouts (e.g., 30s per step, 3m total)
  - Return user-friendly timeout errors

**No Observability/Monitoring:**

- Problem: No structured logging, error tracking, or metrics collection visible
- Blocks: Production issues are hard to debug; no visibility into API performance or failure rates
- Recommendations:
  - Integrate error tracking (Sentry, Axiom, etc.)
  - Add structured logging with request correlation IDs
  - Implement metrics collection (response times, error rates)

**No Database-Level Access Control:**

- Problem: Security relies on application-level validation (whitelist checks, formula construction)
- Blocks: Any application-level vulnerability can bypass access controls
- Recommendations:
  - Use Airtable API tokens with scoped permissions per endpoint
  - Implement database-level row-level security if possible
  - Add audit logging for data access

**No Graceful Degradation Strategy:**

- Problem: When APIs fail (Airtable, MailerSend, Claude), entire features degrade
- Blocks: Users can't complete important actions if any external service is down
- Recommendations:
  - Implement queue-based processing for email/data operations
  - Add retry logic with exponential backoff
  - Cache critical data for read operations

---

## Test Coverage Gaps

**Minimal Test Suite:**

- What's not tested: API endpoints (write, contact-us, about, UK MP email), state management, error handling
- Files: Only 1 test file found: `src/lib/clients/luma/index.test.ts`
- Risk: All business logic is untested; regressions go undetected until production
- Priority: **High** - API endpoints handle user data and external integrations

**No E2E Tests:**

- What's not tested: Multi-step email generation flow, form submissions, locale switching
- Files: No E2E test files found
- Risk: Complex user flows (write API step progression, form validation) are never validated end-to-end
- Priority: **High** - These are critical user-facing features

**No Integration Tests:**

- What's not tested: Airtable API integration, Cloudinary uploads, MailerSend emails, Claude API calls
- Files: No integration test files found
- Risk: External service integrations fail silently or with unexpected behavior
- Priority: **Medium** - Critical but less frequent than unit tests

**No Type Safety Tests:**

- What's not tested: TypeScript `any` types, record type transformations, API response shapes
- Files: `src/routes/api/about/+server.ts` uses unchecked `any` types
- Risk: Runtime errors from data structure mismatches with external APIs
- Priority: **High** - These are infrastructure-level issues

**No Security Tests:**

- What's not tested: Input validation, HTML injection, rate limiting, authentication
- Files: Security considerations above have no corresponding tests
- Risk: Security vulnerabilities go undetected
- Priority: **Critical** - Affects user data and system integrity

---

_Concerns audit: 2026-01-20_
