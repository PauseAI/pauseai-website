import * as Sentry from '@sentry/svelte'
import type { HandleClientError } from '@sveltejs/kit'
// Static (build-time) env on purpose: $env/dynamic/public in any client chunk
// makes prerendered pages block hydration on a runtime fetch of /_app/env.js
// from the SSR function — one 502 and the page loses all JS.
import * as publicEnv from '$env/static/public'
import { navigating } from '$app/state'
import { SENTRY_RELEASE, redactLinkCredentials } from '$lib/sentry'
import { isChunkLoadError, isStaleBuild, reloadOnce } from '$lib/staleBuild'

const GENERIC_ERROR = { message: 'An unexpected error occurred.' }

let dsn: string | undefined

// SvelteKit preloads a link's route when the pointer rests on or presses the link. A failure there
// needs no reload: following the link makes the router see the new deploy and do a full load.
const LINK_PRELOAD_WINDOW_MS = 10_000
let lastPointerOnLink = -Infinity

function notePointerOnLink(event: PointerEvent) {
	if (event.target instanceof Element && event.target.closest('a[href]')) {
		lastPointerOnLink = performance.now()
	}
}

function reloadOnStaleImport({ payload }: VitePreloadErrorEvent) {
	if (navigating.to || !isChunkLoadError(payload)) return
	if (performance.now() - lastPointerOnLink < LINK_PRELOAD_WINDOW_MS) return
	void isStaleBuild().then((stale) => stale && reloadOnce())
}

export const init = () => {
	window.addEventListener('vite:preloadError', reloadOnStaleImport)
	for (const type of ['pointermove', 'pointerdown'] as const) {
		window.addEventListener(type, notePointerOnLink, { capture: true, passive: true })
	}
	dsn = (publicEnv as Record<string, string | undefined>).PUBLIC_SENTRY_DSN
	const release = SENTRY_RELEASE

	if (dsn) {
		try {
			Sentry.init({
				dsn,
				release,
				tracesSampleRate: 0,
				// /verify takes its link out of the address bar, which the history breadcrumb
				// records as `from`.
				beforeBreadcrumb(breadcrumb) {
					const data = breadcrumb.data
					if (data) {
						for (const field of ['from', 'to', 'url']) {
							if (typeof data[field] === 'string') data[field] = redactLinkCredentials(data[field])
						}
					}
					return breadcrumb
				},
				beforeSend(event) {
					if (event.request?.url) event.request.url = redactLinkCredentials(event.request.url)
					return event
				}
			})
		} catch (e) {
			console.error('[Sentry Client] Failed to initialize:', e)
		}
	}
}

export const handleError: HandleClientError = async ({ error, event, status, message }) => {
	// Navigation failures never get here on a replaced deploy: the router checks for one first and
	// does a full load. So the current page means its hydration failed; another URL is a link preload.
	const isCurrentPage =
		event.url.pathname === location.pathname && event.url.search === location.search
	if (isChunkLoadError(error) && isCurrentPage && (await isStaleBuild()) && reloadOnce()) {
		return GENERIC_ERROR
	}
	if (dsn) {
		Sentry.captureException(error, {
			extra: {
				status,
				message,
				url: redactLinkCredentials(event.url?.href),
				route: event.route?.id
			}
		})
	}
	return GENERIC_ERROR
}
