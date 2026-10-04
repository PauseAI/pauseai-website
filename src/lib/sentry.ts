// eslint-disable-next-line no-restricted-syntax
export const SENTRY_RELEASE = import.meta.env.SENTRY_RELEASE as string | undefined

// A verification link's query is reported redacted.
const LINK_CREDENTIAL = /[?&](?:verificationKey|token)=/

export function redactLinkCredentials(href: string): string
export function redactLinkCredentials(href: string | undefined): string | undefined
export function redactLinkCredentials(href: string | undefined): string | undefined {
	return href && LINK_CREDENTIAL.test(href) ? `${href.split('?')[0]}?[redacted]` : href
}
