export const prerender = false

import { dev } from '$app/environment'
import { groupOf, resolveIntentBucket } from '$lib/server/onboardingEmail/blocks.js'
import { listActiveChapterCountries } from '$lib/server/onboardingEmail/chapter.js'
import { describeChapterOverride } from '$lib/server/onboardingEmail/chapterOverrides.js'
import { resolveOnboardingEmailLanguage } from '$lib/server/onboardingEmail/language.js'
import { GLOBAL_DISCORD_URL, WELCOME_CALLS_URL } from '$lib/server/onboardingEmail/brand.js'
import { FIXED_COPY } from '$lib/server/onboardingEmail/fixed.js'
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

/** "[this link](url)" -> "this link", for quoting a line outside the email. */
function plainLinks(markdown: string): string {
	return markdown.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
}

function parseLanguage(value: string | null): BaseLanguage {
	return LANGUAGES.includes(value as BaseLanguage) ? (value as BaseLanguage) : DEFAULTS.language
}

export const load: PageServerLoad = async ({ url }) => {
	if (!dev && !isAllowedHost(url.hostname)) error(404, 'Not found')

	const params = url.searchParams
	const hasQuery = [...params.keys()].length > 0

	const firstName = params.get('firstName')?.trim() || 'Alex'
	const country = hasQuery ? (params.get('country') ?? '') : DEFAULTS.country
	const intent = (hasQuery ? (params.get('intent') ?? '') : DEFAULTS.intent).trim()
	// A signup from a Spanish-speaking country gets Spanish whatever languages they listed, so
	// the choice only means something for a volunteer elsewhere, where it stands in for having
	// listed Spanish. A non-volunteer elsewhere is routed to English, although one who listed
	// Spanish would lose the chapter part: the page locks that control, so a Spanish route kept
	// from an earlier choice would change the email with nothing on screen saying why.
	const spanishCountry = resolveOnboardingEmailLanguage(country, undefined) === 'es'
	const language: BaseLanguage = spanishCountry
		? 'es'
		: groupOf(resolveIntentBucket(intent)) === 'non-volunteer'
			? 'en'
			: parseLanguage(params.get('language'))
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

	// Why the language isn't the reader's to choose, if it isn't. The select then shows the
	// language the email is actually in, rather than the one that was asked for.
	const languageLock = resolved.override
		? 'own-email'
		: resolved.group === 'non-volunteer'
			? 'english-only'
			: spanishCountry
				? 'spanish-country'
				: null

	return {
		form: {
			firstName,
			language: languageLock ? resolved.language : language,
			languageLock,
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
		// The lines composeBlocks() adds to a chapter's own email, quoted in the page's advice so
		// a chapter translating them works from the wording that is actually sent.
		fixedLines: {
			confirm: plainLinks(FIXED_COPY.en.confirm('#')),
			newsletterSubscribed: FIXED_COPY.en.newsletterInOwnWords(true),
			newsletterOtherwise: FIXED_COPY.en.newsletterInOwnWords(undefined)
		},
		resolved,
		// The language the shared copy was routed to, before a non-volunteer falls back to English:
		// a Spanish route drops the country chapter even then.
		routedLanguage: language,
		rendered
	}
}
