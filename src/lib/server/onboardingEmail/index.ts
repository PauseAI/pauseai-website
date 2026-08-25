import { url, verificationParameter } from '$lib/config.js'
import { getChapterForOnboardingEmail } from './chapter.js'
import { resolveOnboardingEmailLanguage } from './language.js'
import { LANGUAGE_COPY } from './copy.js'
import { buildEmailBlocks, resolveIntentBucket } from './blocks.js'
import { renderHtml } from './html.js'
import { renderText } from './text.js'
import type { OnboardingEmailParams, RenderedOnboardingEmail } from './types.js'

export type {
	OnboardingEmailParams,
	RenderedOnboardingEmail,
	OnboardingEmailLanguage
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

	const language = resolveOnboardingEmailLanguage(params.country, params.languages)
	const copy = LANGUAGE_COPY[language]
	const bucket = resolveIntentBucket(params.intent)
	const chapter = await getChapterForOnboardingEmail(params.country)

	const blocks = buildEmailBlocks(params, copy, chapter, verificationLink, bucket)

	return {
		subject: copy.subject(params.firstName),
		html: renderHtml(blocks, copy, unsubscribeLink),
		text: renderText(blocks, copy, unsubscribeLink)
	}
}
