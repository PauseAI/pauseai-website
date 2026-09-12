export const prerender = false

import { dev } from '$app/environment'
import { listActiveChapterCountries } from '$lib/server/onboardingEmail/chapter.js'
import { describeChapterOverride } from '$lib/server/onboardingEmail/chapterOverrides.js'
import { renderOnboardingEmail, resolveOnboardingEmail } from '$lib/server/onboardingEmail/index.js'
import type { BaseLanguage, OnboardingEmailHtmlStyle } from '$lib/server/onboardingEmail/types.js'
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

// The shared copy exists in these (copy.ts). Chapter overrides bring their own language.
const LANGUAGES: BaseLanguage[] = ['en', 'es']

const DEFAULTS = {
	language: 'en' as BaseLanguage,
	country: 'United Kingdom',
	intent: 'Volunteer'
}

function parseLanguage(value: string | null): BaseLanguage {
	return LANGUAGES.includes(value as BaseLanguage) ? (value as BaseLanguage) : DEFAULTS.language
}

// The renderer builds absolute asset URLs on pauseai.info, where these images only exist
// once this is merged and deployed. Point them at whatever origin is serving this page so
// the preview shows the real logo on a deploy preview too.
function withLocalAssets(html: string, origin: string): string {
	return html.replaceAll('https://pauseai.info/pauseai-', `${origin}/pauseai-`)
}

export const load: PageServerLoad = async ({ url }) => {
	if (!dev && !isAllowedHost(url.hostname)) error(404, 'Not found')

	const params = url.searchParams
	const hasQuery = [...params.keys()].length > 0

	const firstName = params.get('firstName') ?? 'Alex'
	const language = parseLanguage(params.get('language'))
	const country = hasQuery ? (params.get('country') ?? '') : DEFAULTS.country
	const intent = hasQuery ? (params.get('intent') ?? '') : DEFAULTS.intent
	// 'auto' (or unset) = let the email's content pick (the UK override -> plain, rest ->
	// rich), matching the production endpoint. 'rich'/'plain' force it.
	const styleParam = params.get('style')
	const htmlStyle: OnboardingEmailHtmlStyle | undefined =
		styleParam === 'plain' || styleParam === 'rich' ? styleParam : undefined

	const renderParams = {
		firstName,
		country,
		intent,
		languageOverride: language,
		htmlStyle,
		airtable_id: 'previewRecordId123'
	}
	const rendered = await renderOnboardingEmail(renderParams)
	rendered.html = withLocalAssets(rendered.html, url.origin)

	// Flagged in the picker so it is obvious which countries replace the shared copy.
	const chapterCountries = (await listActiveChapterCountries()).map((name) => ({
		name,
		override: describeChapterOverride(name)
	}))

	// Surfaced in a small "what the inputs resolved to" panel so it's obvious which
	// branch of the matrix produced the email on screen.
	const resolved = await resolveOnboardingEmail(renderParams)

	return {
		form: { firstName, language, country, intent, style: htmlStyle ?? 'auto' },
		options: {
			languages: LANGUAGES,
			countries: chapterCountries
		},
		resolved,
		rendered
	}
}
