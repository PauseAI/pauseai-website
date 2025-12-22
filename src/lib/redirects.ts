import { redirect } from '@sveltejs/kit'

/** Permanent redirects (301) */
const REDIRECTS: Record<string, string> = {
	'/2025-feb': '/2025-february',
	'/collages/manual_bootstrap.jpg': '/api/images/collages/manual_bootstrap.jpg',
	'/selfie': '/sayno',
	'/people': '/about',
	'/act': '/action',
	'/actions': '/action',
	'/local': '/communities',
	'/local-communities': '/communities',
	'/local-chapters': '/communities',
	'/local-groups': '/communities',
	'/map': '/communities',
	'/national': 'national-groups',
	'/national-communities': '/national-groups',
	'/national-chapters': '/national-groups',
	'/email': '/email-builder',
	'/dangers': '/risks',
	'/polls': '/polls-and-surveys',
	'/surveys': '/polls-and-surveys',
	'/stipends': '/volunteer-stipends',
	'/volunteer-vacancies': '/join#volunteer-vacancies'
}

/** Temporary redirects (302) - for time-limited campaigns, A/B tests, etc. */
const TEMPORARY_REDIRECTS: Record<string, string> = {}

export function handleRedirects(path: string) {
	const permanent = REDIRECTS[path]
	if (permanent) throw redirect(301, permanent)

	const temporary = TEMPORARY_REDIRECTS[path]
	if (temporary) throw redirect(302, temporary)
}
