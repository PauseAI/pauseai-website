export const prerender = false

import { dev } from '$app/environment'
import { INTENTS } from '$lib/components/onboarding/options.js'
import { getChapterForOnboardingEmail } from '$lib/server/onboardingEmail/chapter.js'
import { resolveIntentBucket } from '$lib/server/onboardingEmail/blocks.js'
import {
	renderOnboardingEmail,
	type OnboardingEmailHtmlStyle
} from '$lib/server/onboardingEmail/index.js'
import {
	LEGACY_TEMPLATE_OPTIONS,
	isLegacyTemplateKey,
	renderLegacyTemplate,
	type LegacyTemplateKey
} from '$lib/server/onboardingEmail/legacyTemplates.js'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

// Sibling of /onboarding-email-preview. That page drives the NEW renderer directly
// off free inputs; this one starts from a pre-migration MailerSend template (picked
// from a dropdown) and shows it next to the new email for the combo that template
// was sent for, with Intent left adjustable so the effect of the intent axis on the
// new copy is visible against a fixed old baseline. Same access rules: dev + Netlify
// deploy previews only, 404 on the production domain. (Chapter/template data is
// public, not PII.)
function isAllowedHost(hostname: string): boolean {
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.netlify.app')
}

const DEFAULT_TEMPLATE_KEY: LegacyTemplateKey = 'DEFAULT'
const PREVIEW_RECORD_ID = 'previewRecordId123'

export const load: PageServerLoad = async ({ url }) => {
	if (!dev && !isAllowedHost(url.hostname)) error(404, 'Not found')

	const params = url.searchParams
	const firstName = params.get('firstName') || 'Alex'

	const templateKey = isLegacyTemplateKey(params.get('template'))
		? (params.get('template') as LegacyTemplateKey)
		: DEFAULT_TEMPLATE_KEY

	const legacy = renderLegacyTemplate({
		key: templateKey,
		firstName,
		verificationLink: `https://pauseai.info/verify?table=join&verificationKey=${PREVIEW_RECORD_ID}`
	})

	// Country + language come from the chosen template's canonical combo (the new
	// render's "closest" match); intent is overridable so its effect is visible.
	const { country, language } = legacy.canonical
	const intentParam = params.get('intent')
	const intent = intentParam === null ? legacy.canonical.intent : intentParam

	// 'auto' (or unset) = let the renderer pick per chapter (UK -> plain, rest ->
	// rich), i.e. what the production endpoint does. 'rich'/'plain' force it.
	const styleParam = params.get('style')
	const htmlStyle: OnboardingEmailHtmlStyle | undefined =
		styleParam === 'plain' || styleParam === 'rich' ? styleParam : undefined

	const rendered = await renderOnboardingEmail({
		firstName,
		country,
		intent,
		languageOverride: language,
		htmlStyle,
		airtable_id: PREVIEW_RECORD_ID
	})

	const chapter = await getChapterForOnboardingEmail(country)

	return {
		form: { firstName, templateKey, intent, style: htmlStyle ?? 'auto' },
		newInputs: {
			country,
			language,
			intent,
			intentBucket: resolveIntentBucket(intent),
			chapterName: chapter.name,
			chapterLeader: chapter.leader,
			chapterIsGlobalFallback: chapter.isGlobalFallback,
			chapterLinkCount: chapter.links.length
		},
		options: {
			templates: LEGACY_TEMPLATE_OPTIONS,
			intents: INTENTS
		},
		legacy,
		rendered
	}
}
