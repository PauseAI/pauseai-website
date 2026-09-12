import type { Intent } from '$lib/components/onboarding/options.js'

export type { Intent }

/** Languages the shared copy exists in. See docs/L10N.md for why the site's
 *  Paraglide/inlang pipeline isn't used here (build-time only). */
export type BaseLanguage = 'en' | 'es'

/** Every language an email can go out in: the shared copy's, plus those only a chapter
 *  override is written in. Each needs its fixed lines in fixed.ts. */
export type OnboardingEmailLanguage = BaseLanguage | 'sv'

/** HTML presentation style. `rich` (default) is the branded card layout in
 *  html.ts; `plain` is the stripped-down single-column layout in htmlPlain.ts,
 *  modelled on the PauseAI UK MailerLite template, so it reads closer to a
 *  hand-written note. Same blocks either way; only the wrapper differs. */
export type OnboardingEmailHtmlStyle = 'rich' | 'plain'

/**
 * Input to the render function. Field names mirror the Airtable automation's
 * `input.config()` fields (minus `to_email`/`reply_to_email`/`onboarding_email`,
 * which the render endpoint doesn't need since it never sends anything itself).
 */
export type OnboardingEmailParams = {
	firstName: string
	/** Free-text country name, as stored on the Members record. May be empty/undefined. */
	country?: string
	/** Airtable `Intent` single-select value, e.g. "Volunteer". Unknown/empty falls back to the no-intent copy. */
	intent?: string
	/** Airtable `Languages` multipleSelects value. */
	languages?: string[] | string
	/** Testing/preview only: force the shared copy's language, skipping the country +
	 *  languages detection in resolveOnboardingEmailLanguage. The production render
	 *  endpoint never sets this. */
	languageOverride?: BaseLanguage
	/** Force the HTML wrapper (see OnboardingEmailHtmlStyle). Left unset, as the
	 *  production render endpoint does, the email's own content decides. The
	 *  preview/compare pages set this to force one for QA. */
	htmlStyle?: OnboardingEmailHtmlStyle
	/** Used to build the verification link. */
	airtable_id: string
}

export type RenderedOnboardingEmail = {
	subject: string
	html: string
	text: string
}

/** The three versions the copy varies over, matching the live templates. Anything
 *  that is not Act now, Volunteer or Lead (empty, 'None', 'Keep informed',
 *  unrecognised) gets `none`, the one version that asserts nothing about why the
 *  reader signed up. */
export type IntentBucket = 'none' | 'act-now' | 'volunteer'

/** Chapter overrides vary by group at most, never by the finer bucket. */
export type IntentGroup = 'volunteer' | 'non-volunteer'

/** A single link rendered in the chapter's link/social row. */
export type ChapterLink = {
	label: string
	url: string
}

export type ChapterBlockData = {
	/** Chapter/country display name, e.g. "France". */
	name: string
	/** The chapter's public links, in a fixed display order. May be empty. */
	links: ChapterLink[]
}
