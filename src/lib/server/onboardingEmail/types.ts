import type { Intent } from '$lib/components/onboarding/options.js'

export type { Intent }

/** Languages the shared copy exists in. See docs/L10N.md for why the site's
 *  Paraglide/inlang pipeline isn't used here (build-time only). */
export type BaseLanguage = 'en' | 'es'

/** Every language an email can go out in: the shared copy's, plus those only a chapter
 *  override is written in. Each needs its fixed lines in fixed.ts. */
export type OnboardingEmailLanguage = BaseLanguage | 'sv' | 'de'

/** Keeps work alive past the response: Netlify's `platform.context.waitUntil`. */
export type WaitUntil = (promise: Promise<unknown>) => void

/** HTML presentation style. `rich` (default) is the branded card layout in
 *  html.ts; `plain` is the stripped-down single-column layout in htmlPlain.ts,
 *  modelled on the PauseAI UK MailerLite template, so it reads closer to a
 *  hand-written note. Same blocks either way; only the wrapper differs. */
export type OnboardingEmailHtmlStyle = 'rich' | 'plain'

/** Input to v1's render, which the preview page and tests use. */
export type OnboardingEmailParams = {
	firstName: string
	/** Free-text country name, as stored on the Members record. May be empty/undefined. */
	country?: string
	/** Airtable `Intent` single-select value, e.g. "Volunteer". Unknown/empty falls back to the no-intent copy. */
	intent?: string
	/** Airtable `Languages` multipleSelects value. */
	languages?: string[] | string
	/** Airtable `Email subscription` checkbox. Only the shared email's newsletter line depends on it; undefined
	 *  keeps that line's hedged "if you opted in" wording rather than guessing. */
	subscribed?: boolean
	/** Whether the signup agreed to their details going to their chapter (Airtable
	 *  `GDPR chapter share permission`). Without it the chapter is not told about them, so the
	 *  email may not come from the chapter or say the chapter will be in touch. */
	chapterShare: boolean
	/** Testing/preview only: force the shared copy's language, skipping the country +
	 *  languages detection in resolveOnboardingEmailLanguage. */
	languageOverride?: BaseLanguage
	/** Force the HTML wrapper (see OnboardingEmailHtmlStyle). Left unset, the email's own
	 *  content decides. The preview page sets this to force one for QA. */
	htmlStyle?: OnboardingEmailHtmlStyle
	/** Used to build the verification link. */
	airtable_id: string
	/** Tests pass v2's signed link here to compare the two renders. The preview page leaves it
	 *  out and gets the unsigned link built from `airtable_id`. */
	verificationLink?: string
	/** Where a chapter list read cut short is handed, when there is a platform. */
	waitUntil?: WaitUntil
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

/** Whether the reader signed up to volunteer. Decides the shared copy's language. */
export type IntentGroup = 'volunteer' | 'non-volunteer'

/** A single link rendered in the chapter's link/social row. */
export type ChapterLink = {
	label: string
	url: string
}

export type ChapterBlockData = {
	/** Chapter/country display name, e.g. "France". */
	name: string
	/** The chapter's own name, e.g. "Pause IA", where the copy names who will be in touch.
	 *  Unset, the copy says "PauseAI <name>". */
	displayName?: string
	/** The chapter's public links, in a fixed display order. May be empty. */
	links: ChapterLink[]
}

/** The footer line a v2 caller can ask for: the question, then the link. */
export type UnsubscribeLine = { question: string; linkText: string; url: string }

/** Where the CRM routed the signup. The v2 render takes it as decided and never re-derives it
 *  from the member's country or consent. */
export type OnboardingRouting =
	| { kind: 'global' }
	| {
			kind: 'chapter'
			/** The chapter's id in the CRM. Not shown in the email. */
			chapterId: number
			/** The chapter's own name, e.g. "PauseAI UK". */
			name: string
			/** The country the chapter is filed under. Selects the chapter's own email, if it has
			 *  one, and the chapter-list row its links are read from. */
			country: string
	  }

/** Input to the v2 render, validated by v2Request.ts. */
export type OnboardingEmailV2Params = {
	firstName: string
	/** Already resolved to a language the shared copy exists in. */
	language: BaseLanguage
	intent?: string
	/** The member's Keep me informed answer. Undefined keeps the hedged newsletter line. */
	keepInformed?: boolean
	routing: OnboardingRouting
	/** The Members row the link verifies, as `rec…`. */
	recordId: string
	/** The address the caller is mailing. The link's token is signed over it; it is never
	 *  rendered or returned. */
	toEmail: string
	/** The CRM's opt-out link for this member. Rendered in the footer when set; never fetched. */
	unsubscribeUrl?: string
	/** Where a chapter list read cut short is handed, when there is a platform. Set by the
	 *  route, not the request. */
	waitUntil?: WaitUntil
}

export type RenderedOnboardingEmailV2 = {
	subject: string
	html: string
	text: string
	/** The language the email went out in, which a chapter's own email decides. */
	language: OnboardingEmailLanguage
	/** The chapter's own email in use, or null for the shared copy. */
	chapterOverride: string | null
}
