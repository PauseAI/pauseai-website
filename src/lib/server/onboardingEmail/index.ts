import { url } from '$lib/config.js'
import { mintVerificationToken, verificationLink } from '$lib/server/emailVerification'
import { reportError } from '$lib/server/sentry'
import { baseContent } from './copy.js'
import { composeBlocks, groupOf, resolveIntentBucket } from './blocks.js'
import { getChapterForOnboardingEmail, lookupChapterForOnboardingEmail } from './chapter.js'
import { getChapterOverride, type ResolvedOverride } from './chapterOverrides.js'
import { FIXED_COPY } from './fixed.js'
import { renderHtml } from './html.js'
import { renderHtmlPlain } from './htmlPlain.js'
import { resolveOnboardingEmailLanguage } from './language.js'
import { stripMarkdown } from './markdown.js'
import { renderText } from './text.js'
import type {
	BaseLanguage,
	ChapterBlockData,
	ChapterLink,
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

/** Which version of the email a signup gets. Exported for the preview page. */
export async function resolveOnboardingEmail(
	params: OnboardingEmailParams
): Promise<OnboardingEmailResolution> {
	return (await resolve(params)).resolution
}

// What decides the email, whichever version asked. v1 and v2 differ only in where these come
// from; everything below them is one pipeline.
type Audience = {
	intent?: string
	/** The shared copy's language. */
	language: BaseLanguage
	/** The country whose chapter the email may name, and whose own email it may use. */
	chapterCountry: string | undefined
	/** Whether the chapter hears of this member, and so may speak for itself. */
	chapterShare: boolean
	readChapter: () => Promise<ChapterBlockData | null>
}

async function resolve(params: OnboardingEmailParams) {
	return resolveAudience({
		intent: params.intent,
		language:
			params.languageOverride ?? resolveOnboardingEmailLanguage(params.country, params.languages),
		chapterCountry: params.country,
		chapterShare: params.chapterShare,
		readChapter: () => getChapterForOnboardingEmail(params.country)
	})
}

// The override's content is a function, so it stays out of the resolution, which the preview
// page sends to the browser.
async function resolveAudience(
	audience: Audience
): Promise<{ resolution: OnboardingEmailResolution; override: ResolvedOverride | null }> {
	const bucket = resolveIntentBucket(audience.intent)
	const group = groupOf(bucket)
	// A chapter's own email speaks for the chapter, which only hears of signups who agreed.
	const override = audience.chapterShare
		? getChapterOverride(audience.chapterCountry, bucket)
		: null

	// Spanish speakers share one community, PauseAI en Español, so the shared copy singles out
	// no country's chapter block for them. A chapter's own email is unaffected: it is written
	// in its own language and draws its own links from the row, whatever the signup listed.
	const chapter = !override && audience.language === 'es' ? null : await audience.readChapter()

	return {
		resolution: {
			bucket,
			group,
			language: override ? override.language : audience.language,
			override: override?.name ?? null,
			chapter,
			chapterShare: audience.chapterShare
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
	return compose(resolution, override, params.firstName, link, params.subscribed, params.htmlStyle)
}

/**
 * The v2 render (docs/onboarding-email-v2-contract.md): the caller has already decided the
 * routing, so this decides none of it. Copy and chapter override follow `routing`, never the
 * member's country; the routed chapter's links are read from the chapter list as v1 reads them.
 * The verification link is always signed, with `secret`, over the record id and the address
 * being mailed.
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
	const routed = params.routing.kind === 'chapter' ? params.routing : null
	// Routed by the CRM, a chapter is named even when the chapter list cannot be read.
	const { resolution, override } = await resolveAudience({
		intent: params.intent,
		language: params.language,
		chapterCountry: routed?.country,
		chapterShare: routed !== null,
		readChapter: async () =>
			routed && {
				name: routed.country,
				displayName: routed.name,
				links: await chapterLinks(routed, params)
			}
	})
	const email = compose(
		resolution,
		override,
		params.firstName,
		link,
		params.keepInformed,
		undefined,
		params.unsubscribeUrl
	)
	return { ...email, language: resolution.language, chapterOverride: resolution.override }
}

// A welcome without its chapter links still does its job, so a failed read renders without them.
async function chapterLinks(
	routed: { country: string },
	params: OnboardingEmailV2Params
): Promise<ChapterLink[]> {
	try {
		return (await lookupChapterForOnboardingEmail(routed.country))?.links ?? []
	} catch (error) {
		console.error('Chapter lookup failed, rendering without chapter links:', error)
		await reportError(error, {
			operation: 'onboardingEmailV2ChapterLinks',
			recordId: params.recordId
		})
		return []
	}
}

function compose(
	resolution: OnboardingEmailResolution,
	override: ResolvedOverride | null,
	rawFirstName: string,
	link: string,
	subscribed: boolean | undefined,
	htmlStyleOverride?: OnboardingEmailHtmlStyle,
	unsubscribeUrl?: string
): { subject: string; html: string; text: string } {
	const { bucket, language, chapter, chapterShare } = resolution
	const firstName = stripMarkdown(rawFirstName)
	const content = override
		? override.content(firstName, chapter)
		: baseContent(language === 'es' ? 'es' : 'en', bucket, chapter, chapterShare, firstName)
	const fixed = FIXED_COPY[language]
	const blocks = composeBlocks(content, fixed, bucket, link, override !== null, subscribed)

	const unsubscribe = unsubscribeUrl ? { ...fixed.unsubscribe, url: unsubscribeUrl } : undefined

	const htmlStyle = htmlStyleOverride ?? content.htmlStyle ?? 'rich'
	const html =
		htmlStyle === 'plain'
			? renderHtmlPlain(blocks, language, url, content.socials, unsubscribe)
			: renderHtml(blocks, language, url, content.socials, unsubscribe)

	return { subject: content.subject, html, text: renderText(blocks, content.socials, unsubscribe) }
}
