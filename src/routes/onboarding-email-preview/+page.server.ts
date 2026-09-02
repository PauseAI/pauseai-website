export const prerender = false

import { dev } from '$app/environment'
import { COUNTRIES, INTENTS, LANGUAGES } from '$lib/components/onboarding/options.js'
import { getChapterForOnboardingEmail } from '$lib/server/onboardingEmail/chapter.js'
import { resolveIntentBucket } from '$lib/server/onboardingEmail/blocks.js'
import { renderOnboardingEmail } from '$lib/server/onboardingEmail/index.js'
import { resolveOnboardingEmailLanguage } from '$lib/server/onboardingEmail/language.js'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

// Internal QA tool for eyeballing the onboarding-email render output. Every input the
// renderer takes (first name, country, intent, languages) is an individual control on
// the page; the query string holds the current values so a given preview is
// shareable/bookmarkable. Not linked from the site nav. Available in dev and on
// Netlify deploy previews (*.netlify.app), 404s on the production domain so it can't
// be stumbled onto there. (Chapter data is public National Groups info, not PII, so
// this is safe to expose on preview URLs rather than adding real auth.)
function isAllowedHost(hostname: string): boolean {
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.netlify.app')
}

const DEFAULTS = {
	firstName: 'Alex',
	country: 'United Kingdom',
	intent: 'Volunteer',
	languages: [] as string[]
}

export const load: PageServerLoad = async ({ url }) => {
	if (!dev && !isAllowedHost(url.hostname)) error(404, 'Not found')

	const params = url.searchParams
	const hasQuery = [...params.keys()].length > 0

	const firstName = params.get('firstName') ?? DEFAULTS.firstName
	const country = hasQuery ? (params.get('country') ?? '') : DEFAULTS.country
	const intent = hasQuery ? (params.get('intent') ?? '') : DEFAULTS.intent
	const languages = hasQuery ? params.getAll('languages') : DEFAULTS.languages

	const rendered = await renderOnboardingEmail({
		firstName,
		country,
		intent,
		languages,
		airtable_id: 'previewRecordId123'
	})

	// Surfaced in a small "what the inputs resolved to" panel so it's obvious which
	// branch of the matrix produced the email on screen.
	const chapter = await getChapterForOnboardingEmail(country)
	const resolved = {
		language: resolveOnboardingEmailLanguage(country, languages),
		intentBucket: resolveIntentBucket(intent),
		chapterName: chapter.name,
		chapterLeader: chapter.leader,
		chapterIsGlobalFallback: chapter.isGlobalFallback,
		chapterLinkCount: chapter.links.length
	}

	return {
		form: { firstName, country, intent, languages },
		options: {
			countries: COUNTRIES,
			intents: INTENTS,
			languages: LANGUAGES
		},
		resolved,
		rendered
	}
}
