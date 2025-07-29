import { PUBLIC_SENTRY_DSN } from '$env/static/public'
import * as Sentry from '@sentry/sveltekit'

Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	sendDefaultPii: true
})

export const handleError = Sentry.handleErrorWithSentry()
