import { url, verificationParameter } from '$lib/config.js'
import { baseContent } from './copy.js'
import { composeBlocks, groupOf, resolveIntentBucket } from './blocks.js'
import { getChapterForOnboardingEmail } from './chapter.js'
import { getChapterOverride, type ResolvedOverride } from './chapterOverrides.js'
import { FIXED_COPY } from './fixed.js'
import { renderHtml } from './html.js'
import { renderHtmlPlain } from './htmlPlain.js'
import { resolveOnboardingEmailLanguage } from './language.js'
import { stripMarkdown } from './markdown.js'
import { renderText } from './text.js'
import type {
	ChapterBlockData,
	IntentBucket,
	IntentGroup,
	OnboardingEmailLanguage,
	OnboardingEmailParams,
	RenderedOnboardingEmail
} from './types.js'

export type {
	OnboardingEmailParams,
	RenderedOnboardingEmail,
	OnboardingEmailLanguage,
	OnboardingEmailHtmlStyle
} from './types.js'

export type OnboardingEmailResolution = {
	bucket: IntentBucket
	group: IntentGroup
	language: OnboardingEmailLanguage
	/** Name of the chapter override in use, if any. */
	override: string | null
	/** The chapter's live row, which an override's own copy can draw links from. */
	chapter: ChapterBlockData | null
	chapterShare: boolean
}

// The global sender the Airtable script already uses for every country but the UK.
const GLOBAL_SENDER = { email: 'info@pauseai.info', name: 'PauseAI' }

/**
 * Reads `gdpr_chapter_share`, which the Airtable script forwards from the Members checkbox, off a
 * render request. Only `true` counts as shared: a broken mapping must not tell someone their
 * chapter will contact them when the chapter will never hear of them.
 */
export function chapterShareFromRequest(body: Record<string, unknown>): boolean {
	if (!('gdpr_chapter_share' in body)) {
		console.warn(
			'Render request has no gdpr_chapter_share: treating it as not shared. Check the input mapping in the Airtable automation.'
		)
	}
	return body.gdpr_chapter_share === true
}

/** Which version of the email a signup gets. Exported for the preview pages. */
export async function resolveOnboardingEmail(
	params: OnboardingEmailParams
): Promise<OnboardingEmailResolution> {
	return (await resolve(params)).resolution
}

// The override's content is a function, so it stays out of the resolution, which the preview
// page sends to the browser.
async function resolve(
	params: OnboardingEmailParams
): Promise<{ resolution: OnboardingEmailResolution; override: ResolvedOverride | null }> {
	const bucket = resolveIntentBucket(params.intent)
	const group = groupOf(bucket)
	// A chapter's own email speaks for the chapter, which only hears of signups who agreed.
	const override = params.chapterShare ? getChapterOverride(params.country, bucket) : null
	const detected =
		params.languageOverride ?? resolveOnboardingEmailLanguage(params.country, params.languages)

	// Spanish speakers share one community, PauseAI en Español, so the shared copy singles out
	// no country's chapter block for them. A chapter's own email is unaffected: it is written
	// in its own language and draws its own links from the row, whatever the signup listed.
	const chapter =
		!override && detected === 'es' ? null : await getChapterForOnboardingEmail(params.country)

	return {
		resolution: {
			bucket,
			group,
			// Only English has a non-volunteer version, so Spanish non-volunteers get it, as today.
			language: override ? override.language : group === 'volunteer' ? detected : 'en',
			override: override?.name ?? null,
			chapter,
			chapterShare: params.chapterShare
		},
		override
	}
}

/**
 * Renders the onboarding welcome email (subject + html + text) for a given signup: the
 * shared copy or a chapter's override, inside the skeleton in blocks.ts.
 */
export async function renderOnboardingEmail(
	params: OnboardingEmailParams
): Promise<RenderedOnboardingEmail> {
	if (!params.airtable_id) {
		throw new Error('airtable_id is required to build the verification link')
	}
	const verificationLink = `${url}/verify?table=join&${verificationParameter}=${params.airtable_id}`

	const { resolution, override } = await resolve(params)
	const { bucket, language, chapter } = resolution
	const firstName = stripMarkdown(params.firstName)
	const content = override
		? override.content(firstName, chapter)
		: baseContent(language === 'es' ? 'es' : 'en', bucket, chapter, params.chapterShare, firstName)
	const fixed = FIXED_COPY[language]
	const blocks = composeBlocks(
		content,
		fixed,
		bucket,
		verificationLink,
		override !== null,
		params.subscribed
	)

	const htmlStyle = params.htmlStyle ?? content.htmlStyle ?? 'rich'
	const html =
		htmlStyle === 'plain'
			? renderHtmlPlain(blocks, language, url, content.socials)
			: renderHtml(blocks, language, url, content.socials)

	return {
		subject: content.subject,
		html,
		text: renderText(blocks, content.socials),
		// Left to the script otherwise, which sends a UK signup's email from PauseAI UK.
		...(params.chapterShare ? {} : { from: GLOBAL_SENDER })
	}
}
