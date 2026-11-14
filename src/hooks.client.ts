import * as Sentry from '@sentry/svelte'
import type { HandleClientError } from '@sveltejs/kit'
// Static (build-time) env on purpose: $env/dynamic/public in any client chunk
// makes prerendered pages block hydration on a runtime fetch of /_app/env.js
// from the SSR function — one 502 and the page loses all JS.
import * as publicEnv from '$env/static/public'
import { SENTRY_ENVIRONMENT, SENTRY_RELEASE, redactLinkCredentials } from '$lib/sentry'
import { isChunkLoadError, isSamePage, isStaleBuild, reloadOnce } from '$lib/staleBuild'

const GENERIC_ERROR = { message: 'An unexpected error occurred.' }

let dsn: string | undefined

export const init = () => {
	dsn = (publicEnv as Record<string, string | undefined>).PUBLIC_SENTRY_DSN
	const release = SENTRY_RELEASE

	if (dsn) {
		try {
			Sentry.init({
				dsn,
				release,
				environment: SENTRY_ENVIRONMENT,
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
	if (isChunkLoadError(error) && (await isStaleBuild())) {
		// Navigation failures on a replaced deploy never get here: the router checks for one first and
		// does a full load. On the current page this is a failed hydration, so reload it. Any other URL
		// is a link preload: nothing to report, and the check above set `updated`, so following the
		// link becomes a full load in the root layout.
		if (!isSamePage(event.url, location) || reloadOnce()) return GENERIC_ERROR
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
