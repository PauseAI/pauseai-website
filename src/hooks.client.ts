import * as Sentry from '@sentry/svelte'
import type { HandleClientError } from '@sveltejs/kit'
import { env } from '$env/dynamic/public'

const dsn = env.PUBLIC_SENTRY_DSN

export const init = () => {
	const release = import.meta.env.SENTRY_RELEASE as string | undefined

	console.log(`[Sentry Client] dsn: ${dsn}, release: ${release}`)

	if (dsn) {
		try {
			Sentry.init({
				dsn,
				release,
				tracesSampleRate: 0
			})
			console.log('[Sentry Client] Initialized successfully')
		} catch (e) {
			console.error('[Sentry Client] Failed to initialize:', e)
		}
	} else {
		console.log('[Sentry Client] Skipping initialization (missing DSN)')
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
