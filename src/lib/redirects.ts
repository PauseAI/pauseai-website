import { redirect } from '@sveltejs/kit'

/** Permanent redirects (301) */
const REDIRECTS: Record<string, string> = {
	'/2025-feb': '/2025-february',
	'/collages/manual_bootstrap.jpg': '/api/images/collages/manual_bootstrap.jpg',
	'/selfie': '/sayno',
	'/people': '/about'
}

/** Temporary redirects (302) - for time-limited campaigns, A/B tests, etc. */
const TEMPORARY_REDIRECTS: Record<string, string> = {
	'/littlehelpers': 'https://donorbox.org/pauseai-s-little-helpers'
}

export function handleRedirects(path: string) {
	const permanent = REDIRECTS[path]
	if (permanent) throw redirect(301, permanent)

	const temporary = TEMPORARY_REDIRECTS[path]
	if (temporary) throw redirect(302, temporary)
}
