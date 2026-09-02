export const prerender = false

import { dev } from '$app/environment'
import { renderOnboardingEmail } from '$lib/server/onboardingEmail/index.js'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

// Internal QA tool for eyeballing the onboarding-email render output across a useful
// sample of intent x chapter x language combos before this ships. Not linked from
// anywhere in the site nav. Available in dev and on Netlify deploy previews
// (*.netlify.app), 404s on the production domain so it can't be stumbled onto there.
// (Chapter data is public National Groups info, not PII, so this is safe to expose
// on preview URLs rather than adding real auth.)
function isAllowedHost(hostname: string): boolean {
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.netlify.app')
}
const SAMPLE_PARAMS: {
	label: string
	country: string
	intent: string
	languages: string[]
}[] = [
	{ label: 'UK · Volunteer · en', country: 'United Kingdom', intent: 'Volunteer', languages: [] },
	{
		label: 'UK · Keep informed · en',
		country: 'United Kingdom',
		intent: 'Keep informed',
		languages: []
	},
	{
		label: 'France · Lead · fr (auto by country)',
		country: 'France',
		intent: 'Lead',
		languages: []
	},
	{
		label: 'Spain · Act now · es (auto by country)',
		country: 'Spain',
		intent: 'Act now',
		languages: []
	},
	{
		label: 'Canada · Volunteer · en (no French selected)',
		country: 'Canada',
		intent: 'Volunteer',
		languages: []
	},
	{
		label: 'Canada · Volunteer · fr (French selected)',
		country: 'Canada',
		intent: 'Volunteer',
		languages: ['French']
	},
	{
		label: 'Australia · Volunteer · en (chapter with several links)',
		country: 'Australia',
		intent: 'Volunteer',
		languages: []
	},
	{
		label: 'Atlantis · Keep informed · en (no chapter match -> global fallback)',
		country: 'Atlantis',
		intent: 'Keep informed',
		languages: []
	},
	{
		label: 'Mexico · Volunteer · es (Spanish country, no chapter match)',
		country: 'Mexico',
		intent: 'Volunteer',
		languages: []
	},
	{
		label: 'Germany · empty intent · en (falls back to keep-informed framing)',
		country: 'Germany',
		intent: '',
		languages: []
	}
]

export const load: PageServerLoad = async ({ url }) => {
	if (!dev && !isAllowedHost(url.hostname)) error(404, 'Not found')

	const results = []
	for (const sample of SAMPLE_PARAMS) {
		const rendered = await renderOnboardingEmail({
			firstName: 'Alex',
			country: sample.country,
			intent: sample.intent,
			languages: sample.languages,
			airtable_id: 'previewRecordId123'
		})
		results.push({ label: sample.label, ...rendered })
	}

	return { results }
}
