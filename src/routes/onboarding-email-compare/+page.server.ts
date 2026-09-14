export const prerender = false

import { dev } from '$app/environment'
import {
	renderOnboardingEmail,
	resolveOnboardingEmail,
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

// The renderer builds absolute asset URLs on pauseai.info, where these images only exist
// once this is merged and deployed. Point them at whatever origin is serving this page so
// the preview shows the real logo on a deploy preview too.
function withLocalAssets(html: string, origin: string): string {
	return html.replaceAll('https://pauseai.info/pauseai-', `${origin}/pauseai-`)
}

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

	// 'auto' (or unset) = let the email's content pick (the UK override -> plain, rest ->
	// rich), i.e. what the production endpoint does. 'rich'/'plain' force it.
	const styleParam = params.get('style')
	const htmlStyle: OnboardingEmailHtmlStyle | undefined =
		styleParam === 'plain' || styleParam === 'rich' ? styleParam : undefined

	const renderParams = {
		firstName,
		country,
		intent,
		languageOverride: language,
		htmlStyle,
		airtable_id: PREVIEW_RECORD_ID
	}
	const rendered = await renderOnboardingEmail(renderParams)
	rendered.html = withLocalAssets(rendered.html, url.origin)

	return {
		form: { firstName, templateKey, intent, style: htmlStyle ?? 'auto' },
		newInputs: { country, intent },
		resolved: await resolveOnboardingEmail(renderParams),
		options: {
			templates: LEGACY_TEMPLATE_OPTIONS
		},
		legacy,
		rendered
	}
}
