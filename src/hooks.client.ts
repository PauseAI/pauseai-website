import * as Sentry from '@sentry/svelte'
import type { HandleClientError } from '@sveltejs/kit'
import { env } from '$env/dynamic/public'
import { SENTRY_RELEASE } from '$lib/sentry'

let dsn: string | undefined

export const init = () => {
	dsn = env.PUBLIC_SENTRY_DSN
	const release = SENTRY_RELEASE

	if (dsn) {
		try {
			Sentry.init({
				dsn,
				release,
				tracesSampleRate: 0
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
				url: event.url?.href,
				route: event.route?.id
			}
		})
	}
	return { message: 'An unexpected error occurred.' }
}
