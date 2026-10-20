import { redirectAsError } from '$lib/utils'

/** Permanent redirects (301) */
const REDIRECTS: Record<string, string> = {
	'/2025-feb': '/2025-february',
	'/collages/manual_bootstrap.jpg': '/api/images/collages/manual_bootstrap.jpg',
	'/selfie': '/sayno',
	'/people': '/about',
	'/about-us': '/about',
	'/act': '/action',
	'/actions': '/action',
	'/local': '/communities',
	'/local-communities': '/communities',
	'/local-chapters': '/communities',
	'/local-groups': '/communities',
	'/events': '/communities#events',
	'/groups': '/communities',
	'/map': '/communities',
	'/national': 'national-groups',
	'/national-communities': '/national-groups',
	'/national-chapters': '/national-groups',
	'/email': '/email-builder',
	'/dangers': '/risks',
	'/polls': '/polls-and-surveys',
	'/surveys': '/polls-and-surveys',
	'/stipends': '/volunteer-stipends',
	'/volunteer-vacancies': '/join#volunteer-vacancies',
	'/contact': '/contact-us',
	'/summits': '/summit',
	'/privacy-policy': '/privacy',
	'/australia-wins': '/australia-progress', // moved
	// UK MP email tool moved to PauseAI UK's own site
	'/uk-email-mp': 'https://pauseai.uk/campaigns/',
	'/embed/uk-email-mp': 'https://pauseai.uk/campaigns/',
	// Dear Sir Demis letter moved to PauseAI UK's own site
	'/dear-sir-demis-2025': 'https://pauseai.uk/campaigns/dear-sir-demis-2025'
}

const OUR_XRISK_INTROS_YOUTUBE_PLAYLIST =
	'https://www.youtube.com/watch?v=xBqU1QxCao8&list=PLI46NoubGtIJa0JVCBR-9CayxCOmU0EJt&index=1'
/** Temporary redirects (302) - for time-limited campaigns, A/B tests, etc. */
const TEMPORARY_REDIRECTS: Record<string, string> = {
	'/see-why': OUR_XRISK_INTROS_YOUTUBE_PLAYLIST,
	'/cy': OUR_XRISK_INTROS_YOUTUBE_PLAYLIST
}

export function handleRedirects(path: string) {
	const permanent = REDIRECTS[path]
	if (permanent) throw redirectAsError(301, permanent)

	const temporary = TEMPORARY_REDIRECTS[path]
	if (temporary) throw redirectAsError(302, temporary)
}
