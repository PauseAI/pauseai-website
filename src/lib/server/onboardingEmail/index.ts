import { url } from '$lib/config.js'
import { mintVerificationToken, verificationLink } from '$lib/server/emailVerification'
import { reportError } from '$lib/server/sentry'
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
	OnboardingEmailHtmlStyle,
	OnboardingEmailParams,
	OnboardingEmailV2Params,
	RenderedOnboardingEmail,
	RenderedOnboardingEmailV2
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

// Returned explicitly, since without a `from` the Airtable script sends a UK signup's email from
// PauseAI UK. It is the sender the script already uses for every other country.
const GLOBAL_SENDER = { email: 'info@pauseai.info', name: 'PauseAI' }

/**
 * Reads `gdpr_chapter_share`, which the Airtable script forwards from the Members checkbox, off a
 * render request. Only `true` counts as shared: a broken mapping must not tell someone their
 * chapter will contact them when the chapter will never hear of them.
 */
export async function chapterShareFromRequest(body: Record<string, unknown>): Promise<boolean> {
	if (!('gdpr_chapter_share' in body)) {
		const message =
			'Render request has no gdpr_chapter_share: treating it as not shared. Check the input mapping in the Airtable automation.'
		console.warn(message)
		// Key names only: the values are the signup's personal data.
		await reportError(new Error(message), { receivedKeys: Object.keys(body).sort() })
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
			language: override ? override.language : detected,
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
	const link = params.verificationLink ?? verificationLink(params.airtable_id)

	const { resolution, override } = await resolve(params)
	const email = compose(
		resolution,
		override,
		params.firstName,
		link,
		params.subscribed,
		params.htmlStyle
	)
	return { ...email, ...(resolution.chapterShare ? {} : { from: GLOBAL_SENDER }) }
}

/**
 * The v2 render (docs/onboarding-email-v2-contract.md): the caller has already decided the
 * routing and language, so this reads nothing and decides neither. Copy and chapter override
 * follow `routing`, never the member's country. The verification link is always signed, with
 * `secret`, over the record id and the address being mailed.
 */
export async function renderOnboardingEmailV2(
	params: OnboardingEmailV2Params,
	secret: string,
	now = Date.now()
): Promise<RenderedOnboardingEmailV2> {
	const link = verificationLink(
		params.recordId.replace(/^rec/, ''),
		await mintVerificationToken(secret, params.recordId, params.toEmail, now)
	)
	const bucket = resolveIntentBucket(params.intent)
	const routed = params.routing.kind === 'chapter' ? params.routing : null
	const override = routed ? getChapterOverride(routed.country, bucket) : null
	const chapter: ChapterBlockData | null =
		routed && (override || params.language !== 'es')
			? { name: routed.country, displayName: routed.name, links: routed.links }
			: null
	const language = override ? override.language : params.language
	const resolution: OnboardingEmailResolution = {
		bucket,
		group: groupOf(bucket),
		language,
		override: override?.name ?? null,
		chapter,
		chapterShare: routed !== null
	}
	const email = compose(resolution, override, params.firstName, link, params.keepInformed)
	return { ...email, language, chapterOverride: resolution.override }
}

function compose(
	resolution: OnboardingEmailResolution,
	override: ResolvedOverride | null,
	rawFirstName: string,
	link: string,
	subscribed: boolean | undefined,
	htmlStyleOverride?: OnboardingEmailHtmlStyle
): { subject: string; html: string; text: string } {
	const { bucket, language, chapter, chapterShare } = resolution
	const firstName = stripMarkdown(rawFirstName)
	const content = override
		? override.content(firstName, chapter)
		: baseContent(language === 'es' ? 'es' : 'en', bucket, chapter, chapterShare, firstName)
	const fixed = FIXED_COPY[language]
	const blocks = composeBlocks(content, fixed, bucket, link, override !== null, subscribed)

	const htmlStyle = htmlStyleOverride ?? content.htmlStyle ?? 'rich'
	const html =
		htmlStyle === 'plain'
			? renderHtmlPlain(blocks, language, url, content.socials)
			: renderHtml(blocks, language, url, content.socials)

	return { subject: content.subject, html, text: renderText(blocks, content.socials) }
}
