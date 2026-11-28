// eslint-disable-next-line no-restricted-syntax
export const SENTRY_RELEASE = import.meta.env.SENTRY_RELEASE as string | undefined
// eslint-disable-next-line no-restricted-syntax
export const SENTRY_ENVIRONMENT = import.meta.env.SENTRY_ENVIRONMENT as string

// A verification link's query is reported redacted.
const LINK_CREDENTIAL = /[?&](?:verificationKey|token)=/

export function redactLinkCredentials(href: string): string
export function redactLinkCredentials(href: string | undefined): string | undefined
export function redactLinkCredentials(href: string | undefined): string | undefined {
	return href && LINK_CREDENTIAL.test(href) ? `${href.split('?')[0]}?[redacted]` : href
}

// Sentry's ingest stores a location looked up from the connecting address as `user.geo`,
// unless the event already carries one: an empty object leaves it empty.
export function dropLocation(event: { user?: { geo?: object } }) {
	event.user = { ...event.user, geo: {} }
}
