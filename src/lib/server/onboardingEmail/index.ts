import { url, verificationParameter } from '$lib/config.js'
import { getChapterForOnboardingEmail } from './chapter.js'
import { resolveOnboardingEmailLanguage } from './language.js'
import { LANGUAGE_COPY } from './copy.js'
import { buildEmailBlocks, resolveIntentBucket } from './blocks.js'
import { getChapterOverride } from './chapterOverrides.js'
import { renderHtml } from './html.js'
import { renderHtmlPlain } from './htmlPlain.js'
import { renderText } from './text.js'
import type { OnboardingEmailParams, RenderedOnboardingEmail } from './types.js'

export type {
	OnboardingEmailParams,
	RenderedOnboardingEmail,
	OnboardingEmailLanguage,
	OnboardingEmailHtmlStyle
} from './types.js'

/**
 * Renders the full volunteer-onboarding welcome email (subject + html + text) for a
 * given signup, matrixed on intent x chapter x language. See
 * ~/.claude/projects/-Users-harryturnbull-pauseai-website/memory/project-email-template-redesign.md
 * for the architecture decision record this implements.
 */
export async function renderOnboardingEmail(
	params: OnboardingEmailParams
): Promise<RenderedOnboardingEmail> {
	if (!params.airtable_id) {
		throw new Error('airtable_id is required to build verification/unsubscribe links')
	}

	const verificationLink = `${url}/verify?table=join&${verificationParameter}=${params.airtable_id}`
	const unsubscribeLink = `${url}/api/unsubscribe?${verificationParameter}=${params.airtable_id}`

	const language =
		params.languageOverride ?? resolveOnboardingEmailLanguage(params.country, params.languages)
	const copy = LANGUAGE_COPY[language]
	const bucket = resolveIntentBucket(params.intent)
	const chapter = await getChapterForOnboardingEmail(params.country)

	// A matching chapter override (currently just PauseAI UK) swaps in its own
	// hand-written copy + subject in place of the generic multi-section blocks.
	const override = getChapterOverride(params.country, language)
	const blocks = override
		? override.buildBlocks({ firstName: params.firstName, verificationLink, bucket })
		: buildEmailBlocks(params, copy, chapter, verificationLink, bucket)
	const subject = override ? override.subject(params.firstName) : copy.subject(params.firstName)

	// static/pauseai-logo-email.png — the PauseAI wordmark from the pre-migration
	// PauseAI UK template, re-hosted in the repo. Must be an absolute URL for email.
	const logoUrl = `${url}/pauseai-logo-email.png`

	// Style precedence: an explicit caller override (the preview/compare pages) wins;
	// otherwise the matched chapter decides (UK -> plain); otherwise rich.
	const htmlStyle = params.htmlStyle ?? override?.htmlStyle ?? 'rich'
	const html =
		htmlStyle === 'plain'
			? renderHtmlPlain(blocks, copy, unsubscribeLink, logoUrl)
			: renderHtml(blocks, copy, unsubscribeLink)

	return {
		subject,
		html,
		text: renderText(blocks, copy, unsubscribeLink)
	}
}
