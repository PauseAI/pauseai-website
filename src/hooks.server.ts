import { PUBLIC_SENTRY_DSN } from '$env/static/public'
import { paraglideMiddleware } from '$lib/paraglide/server.js'
import * as Sentry from '@sentry/sveltekit'
import { type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	sendDefaultPii: true
})

const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', locale)
		})
	})

const sentryHandle = Sentry.sentryHandle()

export const handle = sequence(sentryHandle, paraglideHandle)

export const handleError = Sentry.handleErrorWithSentry()
