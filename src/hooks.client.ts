import * as Sentry from '@sentry/svelte'
import type { HandleClientError } from '@sveltejs/kit'
import { env } from '$env/dynamic/public'

const dsn = env.PUBLIC_SENTRY_DSN

export const init = () => {
	if (dsn) {
		try {
			Sentry.init({
				dsn,
				release: import.meta.env.SENTRY_RELEASE as string | undefined,
				tracesSampleRate: 0
			})
		} catch (e) {
			console.error('Failed to initialize Sentry:', e)
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
