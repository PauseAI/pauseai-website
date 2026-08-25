import type { Intent } from '$lib/components/onboarding/options.js'

export type { Intent }

/** Languages this renderer hand-maintains copy for. See docs/L10N.md for why
 *  the site's Paraglide/inlang pipeline isn't used here (build-time only). */
export type OnboardingEmailLanguage = 'en' | 'es' | 'fr'

/**
 * Input to the render function. Field names mirror the Airtable automation's
 * `input.config()` fields (minus `to_email`/`reply_to_email`/`onboarding_email`,
 * which the render endpoint doesn't need since it never sends anything itself).
 */
export type OnboardingEmailParams = {
	firstName: string
	/** Free-text country name, as stored on the Members record. May be empty/undefined. */
	country?: string
	/** Airtable `Intent` single-select value, e.g. "Volunteer". Unknown/empty falls back to non-volunteer framing. */
	intent?: string
	/** Airtable `Languages` multipleSelects value. */
	languages?: string[] | string
	/** Used to build the verification and unsubscribe links. */
	airtable_id: string
}

export type RenderedOnboardingEmail = {
	subject: string
	html: string
	text: string
}

/** The four intent buckets the email copy varies over. Anything else (empty, 'None', unrecognised) falls back to `keep-informed`, matching the old script's non-volunteer fallback. */
export type IntentBucket = 'act-now' | 'keep-informed' | 'volunteer' | 'lead'

/** A single link rendered in the chapter's link/social row. */
export type ChapterLink = {
	label: string
	url: string
}

export type ChapterBlockData = {
	/** True when this is the hardcoded global fallback (no National Groups match). */
	isGlobalFallback: boolean
	/** Chapter/country display name, e.g. "France", or "Global" for the fallback. */
	name: string
	/** Leader name(s), joined with " and ". */
	leader: string
	/** Non-empty social/community links for this chapter, in a fixed display order. */
	links: ChapterLink[]
}
