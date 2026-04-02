// Fix for Netlify's Deno edge runtime (not standard Deno)
//
// Netlify's Deno 2.3.1 provides a partial window stub (window exists but window.location
// is undefined) for library compatibility. Standard Deno correctly has no window object.
// This partial stub breaks paraglide-js which assumes window.location exists if window exists.
//
// Deleting the stub makes Netlify's Deno behave like standard Deno/Node.js.
// See: notes/20251113-paraglide-edge-function-investigation.md
declare const Deno: unknown
if (
	typeof Deno !== 'undefined' &&
	typeof window !== 'undefined' &&
	typeof window.location === 'undefined'
) {
	delete (globalThis as { window?: Window }).window
}

import { type Handle, type HandleServerError } from '@sveltejs/kit'
import { env } from '$env/dynamic/public'
import { paraglideMiddleware } from '$lib/paraglide/server.js'

let Sentry: typeof import('@sentry/deno') | undefined

export const init = async () => {
	if (env.PUBLIC_SENTRY_DSN) {
		try {
			Sentry = await import('@sentry/deno')
			Sentry.init({
				dsn: env.PUBLIC_SENTRY_DSN,
				release: import.meta.env.SENTRY_RELEASE as string | undefined,
				tracesSampleRate: 0,
				enableLogs: true
			})
		} catch (e) {
			console.error('Failed to initialize Sentry:', e)
		}
	}
}

const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', locale)
		})
	})

export { handle }

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	if (Sentry) {
		Sentry.captureException(error, {
			extra: {
				status,
				message,
				url: event.url?.href,
				method: event.request?.method
			}
		})
		const context = event.platform?.context as { waitUntil?: (p: Promise<unknown>) => void }
		if (context?.waitUntil) {
			context.waitUntil(Sentry.flush(2000))
		}
	}
	return { message: 'An unexpected error occurred.' }
}
