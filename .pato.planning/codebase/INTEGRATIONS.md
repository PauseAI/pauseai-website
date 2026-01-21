# External Integrations

**Analysis Date:** 2026-01-20

## APIs & External Services

**AI/LLM Services:**

- OpenAI GPT-4o - Chat feature at `/api/chat`
  - SDK/Client: Direct API calls via `fetch`
  - Auth: `OPENAI_KEY` environment variable
  - Used by: `src/routes/api/chat/+server.ts`

- Anthropic Claude 3.7 Sonnet - Email writing assistant at `/api/write`
  - SDK/Client: `@anthropic-ai/sdk` (v0.39.0)
  - Auth: `ANTHROPIC_API_KEY_FOR_WRITE` environment variable
  - Model: claude-3-7-sonnet-20250219
  - Context: Max 4096 tokens per request
  - Used by: `src/routes/api/write/+server.ts`

- OpenRouter API - Localization content generation (optional, CI/CD only)
  - Auth: `L10N_OPENROUTER_API_KEY` environment variable
  - Used in: Build scripts for translating content to multiple locales

**Event Management:**

- Luma.io Calendar API - Event listings and scheduling
  - SDK/Client: Custom Axios wrapper in `src/lib/clients/luma/index.ts`
  - Base URL: `https://api.lu.ma/`
  - Endpoints: `/calendar/get-items` (paginated, future events only)
  - Client initialization: Axios with snake_case key transformation
  - Used by: Calendar feature pages

**Business Productivity:**

- Airtable - Primary data source for users, teams, and national groups
  - SDK/Client: `airtable` (v0.12.2) SDK
  - Read API: `https://api.airtable.com/v0/{baseId}/{tableId}`
  - Auth: `AIRTABLE_API_KEY` (read-only) and `AIRTABLE_WRITE_API_KEY` (for email verification)
  - Base IDs used:
    - `appWPTGqZmUcs3NWu` - Main PauseAI base (teams, national groups, about data)
    - `appBInVvIm6opJ1Ob` - UK Politicians base (MP contact info, email sending tracking)
  - Fallback behavior: Development mode returns mock data if API unavailable
  - Used by:
    - `src/lib/airtable.ts` - Centralized Airtable client with pagination
    - `src/routes/api/about/+server.ts` - About page data
    - `src/routes/api/teams/+server.ts` - Team listings
    - `src/routes/api/national-groups/+server.ts` - National groups directory
    - `src/routes/api/signatories/+server.ts` - Signatory data
    - `src/routes/api/uk-lookup-mp/+server.ts` - MP lookup
    - `src/routes/api/uk-send-mp-email/+server.ts` - Email submission tracking

## Data Storage

**Databases:**

- Airtable - Primary database (not traditional DB)
  - Connection: API key authentication
  - Client: `airtable` SDK (0.12.2)
  - Rate limiting: Server-side rate limit of 50 emails/minute for MP email submissions
  - Record types: People, teams, national groups, MP contact data, email verification records

**File Storage:**

- Static filesystem only
  - Images served from `static/` directory via `src/routes/api/images/[...path]/+server.ts`
  - Assets in `src/assets/` (icon files, fonts)
  - No cloud storage integration (S3, etc.)

**Search Indexing:**

- Pagefind - Client-side static site search
  - Build-time index generation via `src/scripts/create-pagefind-index.ts`
  - Index stored in build output for browser-side search
  - No backend search service

**Caching:**

- None - No Redis or Memcached integration
- HTTP caching configured in Netlify build process

## Authentication & Identity

**Auth Provider:**

- Custom implementation (no OAuth/third-party)
- Email verification flow: Contact form submissions → Airtable write verification → User confirmation
- Rate limiting on sensitive endpoints (MP email: 50/minute)
- Implemented in: `src/routes/api/verify/+server.ts`

## Email Delivery

**Primary Email Service:**

- MailerSend - Outbound email for contact forms
  - API: `https://api.mailersend.com/v1/email`
  - Auth: Bearer token via `MAILERSEND_API_KEY`
  - Sends to: `info@pauseai.info`, `press@pauseai.info` based on contact form type
  - Used by: `src/routes/contact-us/+page.server.ts`

**Secondary Email Flow:**

- Airtable Automation - MP email submissions trigger Airtable automations
  - Flow: Form data → Airtable table write → Automation sends email
  - Used by: `src/routes/api/uk-send-mp-email/+server.ts`

## Monitoring & Observability

**Error Tracking:**

- None detected - No Sentry, Rollbar, or similar integration

**Logs:**

- Console logging (stdout) - Server-side logs via Node.js console methods
- Available in: Netlify deploy logs, local terminal output
- Prefixed with emojis for clarity (✏️ for write feature, 🤖 for generated content)

## CI/CD & Deployment

**Hosting:**

- Netlify - Production deployment platform
  - Adapter: `@sveltejs/adapter-netlify` (5.2.4)
  - Edge functions: Enabled via `@netlify/edge-functions` (2.19.0)
  - Deploy directory: `build/`
  - Build command: `pnpm run build`

**CI Pipeline:**

- GitHub Actions (inferred from `.github/` directory)
- Pre-commit hooks via Husky for linting
- Build scripts in `scripts/` executed during build

**Repository:**

- GitHub (main branch, commits track PRs and features)

## Environment Configuration

**Required env vars (Production):**

- `AIRTABLE_API_KEY` - Must be set for data retrieval
- `AIRTABLE_WRITE_API_KEY` - Must be set for email verification and MP contact submission
- `MAILERSEND_API_KEY` - Must be set for contact form emails
- `OPENAI_KEY` - Optional (chat feature disabled if missing)
- `ANTHROPIC_API_KEY_FOR_WRITE` - Optional (email generation limited if missing)

**Optional env vars:**

- `L10N_OPENROUTER_API_KEY` - For CI/CD localization generation
- `PARAGLIDE_LOCALES` - Override active locales (default: "en", set to "all" in CI)
- `L10N_BRANCH` - Override l10n cache branch (defaults to current branch or main)
- `VITE_DISABLE_SOURCEMAPS` - Set to disable sourcemaps in production

**Secrets location:**

- Netlify environment variables UI for production
- `.env` file for local development (template: `template.env`)

## Webhooks & Callbacks

**Incoming:**

- Netlify automatic deploys on push to main branch
- No webhook endpoints exposed (verified by endpoint listing)

**Outgoing:**

- Airtable write operations trigger automations (implicit callback)
- Email submissions to MP contacts via MailerSend/Airtable automation

## Rate Limiting & Quotas

**MP Email Endpoint:**

- 50 requests per minute per server instance
- Implemented via in-memory timestamp tracking
- Returns HTTP 429 if exceeded
- Location: `src/routes/api/uk-send-mp-email/+server.ts`

## API Response Patterns

**Standard Endpoints:**

- JSON responses with `{ response: string }` for chat
- JSON with data arrays for data endpoints (about, teams, national-groups)
- Error responses: `{ error: string, message?: string }` with HTTP status codes

**Error Handling:**

- HTTP status codes: 400 (bad request), 429 (rate limit), 500 (server error)
- Try/catch blocks around external API calls
- Fallback data in development mode for Airtable
- API availability checks (return `{ apiAvailable: false }` if key missing)

---

_Integration audit: 2026-01-20_
