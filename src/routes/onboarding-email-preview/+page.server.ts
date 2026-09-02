export const prerender = false

import { dev } from '$app/environment'
import { INTENTS } from '$lib/components/onboarding/options.js'
import {
	getChapterForOnboardingEmail,
	listActiveChapterCountries
} from '$lib/server/onboardingEmail/chapter.js'
import { resolveIntentBucket } from '$lib/server/onboardingEmail/blocks.js'
import { renderOnboardingEmail } from '$lib/server/onboardingEmail/index.js'
import type { OnboardingEmailLanguage } from '$lib/server/onboardingEmail/types.js'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

// Internal QA tool for eyeballing the onboarding-email render output. Every axis the
// email varies over (language, intent, country/chapter) is an individual control on
// the page; the query string holds the current values so a given preview is
// shareable/bookmarkable. Not linked from the site nav. Available in dev and on
// Netlify deploy previews (*.netlify.app), 404s on the production domain so it can't
// be stumbled onto there. (Chapter data is public National Groups info, not PII, so
// this is safe to expose on preview URLs rather than adding real auth.)
function isAllowedHost(hostname: string): boolean {
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.netlify.app')
}

// The renderer hand-maintains copy for exactly these three (copy.ts: LANGUAGE_COPY).
const LANGUAGES: OnboardingEmailLanguage[] = ['en', 'es', 'fr']

const DEFAULTS = {
	language: 'en' as OnboardingEmailLanguage,
	country: 'United Kingdom',
	intent: 'Volunteer'
}

function parseLanguage(value: string | null): OnboardingEmailLanguage {
	return LANGUAGES.includes(value as OnboardingEmailLanguage)
		? (value as OnboardingEmailLanguage)
		: DEFAULTS.language
}

export const load: PageServerLoad = async ({ url }) => {
	if (!dev && !isAllowedHost(url.hostname)) error(404, 'Not found')

	const params = url.searchParams
	const hasQuery = [...params.keys()].length > 0

	const firstName = params.get('firstName') ?? 'Alex'
	const language = parseLanguage(params.get('language'))
	const country = hasQuery ? (params.get('country') ?? '') : DEFAULTS.country
	const intent = hasQuery ? (params.get('intent') ?? '') : DEFAULTS.intent

	const rendered = await renderOnboardingEmail({
		firstName,
		country,
		intent,
		languageOverride: language,
		airtable_id: 'previewRecordId123'
	})

	const chapterCountries = await listActiveChapterCountries()

	// Surfaced in a small "what the inputs resolved to" panel so it's obvious which
	// branch of the matrix produced the email on screen.
	const chapter = await getChapterForOnboardingEmail(country)
	const resolved = {
		intentBucket: resolveIntentBucket(intent),
		chapterName: chapter.name,
		chapterLeader: chapter.leader,
		chapterIsGlobalFallback: chapter.isGlobalFallback,
		chapterLinkCount: chapter.links.length
	}

	return {
		form: { firstName, language, country, intent },
		options: {
			languages: LANGUAGES,
			countries: chapterCountries,
			intents: INTENTS
		},
		resolved,
		rendered
	}
}
