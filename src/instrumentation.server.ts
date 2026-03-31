import * as Sentry from '@sentry/sveltekit'

Sentry.init({
	dsn: 'https://279d43fd44c785161db6050176196b5e@o4509753398722560.ingest.de.sentry.io/4511139041050704',

	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
})
