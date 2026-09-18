export const prerender = false

import { dev } from '$app/environment'
import { listActiveChapterCountries } from '$lib/server/onboardingEmail/chapter.js'
import { describeChapterOverride } from '$lib/server/onboardingEmail/chapterOverrides.js'
import { GLOBAL_DISCORD_URL, WELCOME_CALLS_URL } from '$lib/server/onboardingEmail/brand.js'
import { renderOnboardingEmail, resolveOnboardingEmail } from '$lib/server/onboardingEmail/index.js'
import type { BaseLanguage, OnboardingEmailHtmlStyle } from '$lib/server/onboardingEmail/types.js'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

// Deploy-preview URLs of this page are handed to chapter leads, not only developers, so the
// page itself avoids code detail. The query string is the whole state, so a preview can be
// shared or bookmarked. Available in dev and on Netlify deploy previews (*.netlify.app),
// 404s on the production domain. (Chapter data is public National Groups info, not PII, so
// this is safe to expose on preview URLs rather than adding real auth.)
function isAllowedHost(hostname: string): boolean {
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.netlify.app')
}

// The shared copy exists in these (copy.ts). Chapter overrides bring their own language.
const LANGUAGES: BaseLanguage[] = ['en', 'es']

const DEFAULTS = {
	language: 'en' as BaseLanguage,
	// The shared email, which is what most countries get, rather than one chapter's own.
	country: '',
	intent: 'Volunteer'
}

// The page's intent select offers these. Any other value renders as None, so the select
// shows None rather than going blank.
const INTENT_CHOICES = ['None', 'Act now', 'Volunteer', 'Lead']

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

	const firstName = params.get('firstName')?.trim() || 'Alex'
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
	const [rendered, countryNames, resolved] = await Promise.all([
		renderOnboardingEmail(renderParams),
		listActiveChapterCountries(),
		resolveOnboardingEmail(renderParams)
	])

	return {
		form: {
			firstName,
			language,
			country,
			intent: INTENT_CHOICES.includes(intent) ? intent : 'None',
			style: htmlStyle ?? 'auto'
		},
		options: {
			languages: LANGUAGES,
			// Flagged in the picker so it is obvious which countries replace the shared copy.
			countries: countryNames.map((name) => ({ name, override: describeChapterOverride(name) }))
		},
		// For the page's advice to chapters, from the constants the emails themselves use.
		globalLinks: { welcomeCalls: WELCOME_CALLS_URL, discord: GLOBAL_DISCORD_URL },
		resolved,
		rendered,
		// Copy HTML takes `rendered.html`: these asset URLs die with the deploy preview.
		previewHtml: withLocalAssets(rendered.html, url.origin)
	}
}
