// Server-side Sentry helper for non-fatal errors that are intentionally
// swallowed (e.g. Airtable write failures surfaced to the user via
// `fail()`). Such errors never reach `hooks.server.ts`'s `handleError`, so
// they must be reported explicitly to avoid silent outages.
//
// Relies on the global `@sentry/deno` client initialized by `hooks.server.ts`
// at server startup; `captureException` is a safe no-op if that init hasn't
// run (e.g. in the Node dev server or during prerender). The lazy import keeps
// this safe to import from any server context without pulling the SDK eagerly.

// `Deno` is provided by Netlify's edge runtime but not by the Node dev server
// or prerender build. Mirror the declaration in `hooks.server.ts` so this
// module type-checks in all contexts.
declare const Deno: unknown

/**
 * Reports a non-fatal error to Sentry. Safe to call from any server code;
 * resolves to `void` and never throws if Sentry is unavailable or reporting
 * fails. Use for errors that are caught and handled (so `handleError` won't
 * fire) but should still be monitored.
 */
export async function reportError(
	error: unknown,
	context?: Record<string, unknown>
): Promise<void> {
	try {
		// Only the Netlify Deno edge runtime has `Deno`; skip elsewhere so the
		// Node dev server and prerender build don't pull `@sentry/deno`.
		if (typeof Deno === 'undefined') return
		const { captureException } = await import('@sentry/deno')
		captureException(error, context ? { extra: context } : undefined)
	} catch (e) {
		console.error('[Sentry Server lib] reportError failed:', e)
	}
}
