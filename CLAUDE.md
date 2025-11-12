# CLAUDE.md PauseAI Website Project Context

This project focuses on the PauseAI.info website, with particular attention to the email composition tool that helps volunteers craft effective outreach messages. Ignore the fact that "pauseai-l10n" features in the directory path.

## Website Architecture

The website is built with:

- **Framework**: SvelteKit
- **Hosting**: Netlify
- **Rendering**: Primarily static with some dynamic content
- **Data Source**: AirTable for dynamic content
- **API Routes**: Mix of serverless and edge functions

## Key Components

### Server Functions & API Routes

The website includes several API endpoints, including:

- the one of concern, `/api/write` - Email composition tool with web search capabilities
- as an arbitrary other example, `/api/teams` - Team/national groups information

### Function Types & Timeout Constraints

**Edge Functions:**

- 50ms compute limit and 30-50s request timeout
- Single 3MB function file when `edge: true`
- Cannot be used with `split: true`

**Serverless Functions:**

- 30-second execution limit (standard: can fluctuate)
- 15-minute limit for background functions (paid tier, which we have just enabled and not yet used)
- Individual function files when using `split: true`
- Automatically created for API routes called during prerendering

### Configuration Options

**SvelteKit Configuration** (`svelte.config.js`):

```javascript
adapter: adapterPatchPrerendered(
  adapterNetlify({
    edge: false,
    split: true     // Split into individual serverless functions
  })
),
```

**Key Trade-offs:**

- Edge functions are faster but have stricter timeout limits
- Serverless functions allow longer execution but may have cold starts
- `split: true` creates smaller, more manageable function files
- Cannot combine `edge: true` with `split: true`

## Email Composition Tool

### Current Status (2025-08-04)

#### Architecture Refactor in Progress

- **Migration**: Moving from array-based forms to DOM-driven data-attribute pattern
- **Stage 1 (discover)**: ✅ Migrated to new pattern using `<fieldset name="discover">` with `data-prompt` attributes
- **Stages 2-5**: Still using array-based system, working but not yet migrated
- **Dual system**: Both patterns coexist during migration period

#### Form Pattern (New)

```html
<fieldset name="discover">
	<label
		>Field Label:
		<input name="search" data-prompt="Contact Search" />
	</label>
</fieldset>
```

- Fields with `data-prompt` are collected for LLM prompts
- Path derived from `fieldset[name] + input[name]` → `info.discover.search`
- Generic handlers: `handleInfoField()`, `buildPromptFromStage()`

#### Testing Status

- Stage 1-2: Working with current changes
- UK volunteer use case: Ready for DeepMind campaign
- Local dev: Use `pnpm dev` (no timeouts)
- Production testing: Use `netlify serve`

### Functionality

- Helps users craft personalized outreach emails
- Incorporates web search for relevant information
- Multi-step workflow with conversation-style interaction

### API Usage Pattern

The `/api/write` endpoint follows this pattern:

1. **Initial request**: Conversation array format to get `stateToken`
   ```json
   [{ "content": "[1]Target info:\nEdinburgh AI safety\n\n", "role": "user" }]
   ```
2. **Continue request**: Use `stateToken` to proceed with workflow
   ```json
   { "stateToken": "...", "continue": true }
   ```

### Known Challenges

- Web search functionality requires ~67 seconds processing time
- Currently hits 30-second serverless function timeout
- Previously hit 10-second edge function timeout
- Requires optimization or alternate implementation approaches

## Code Quality Checks

**IMPORTANT**: Before committing and pushing changes, ALWAYS run:

- `pnpm check` - Runs svelte-check for TypeScript and Svelte errors
- `pnpm lint` - Checks ESLint rules

Both commands must pass without errors before pushing. Warnings can be addressed separately but errors must be fixed.
