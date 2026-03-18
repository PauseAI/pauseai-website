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

import { type Handle } from '@sveltejs/kit'
import { paraglideMiddleware } from '$lib/paraglide/server.js'

const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', locale)
		})
	})

export { handle }
