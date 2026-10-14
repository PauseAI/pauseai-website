import * as Sentry from '@sentry/svelte'
import type { HandleClientError } from '@sveltejs/kit'
// Static (build-time) env on purpose: $env/dynamic/public in any client chunk
// makes prerendered pages block hydration on a runtime fetch of /_app/env.js
// from the SSR function — one 502 and the page loses all JS.
import * as publicEnv from '$env/static/public'
import { SENTRY_RELEASE, redactLinkCredentials } from '$lib/sentry'

let dsn: string | undefined

export const init = () => {
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

export const handleError: HandleClientError = ({ error, event, status, message }) => {
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
	return { message: 'An unexpected error occurred.' }
}
