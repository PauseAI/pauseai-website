// cspell:ignore Kwikstaartlaan

import type { EmailBlock } from './blocks.js'
import type { IntentBucket, OnboardingEmailHtmlStyle } from './types.js'

// Per-chapter copy overrides. Some chapters run their own onboarding email with a
// distinct voice that shouldn't be flattened into the generic multi-section copy in
// copy.ts. When an override matches, it replaces the whole block list and the
// subject; the language/intent/chapter-data plumbing in index.ts still runs (for the
// preview page's "resolved" panel) but its blocks are discarded.
//
// Currently only PauseAI UK, whose pre-migration template
// (email-templates/uk-non-volunteering-*.json) is a short, hand-written note — the
// "plainer email" this reproduces. English only; a UK signup in es/fr falls back to
// the generic copy.

type ChapterOverrideArgs = {
	firstName: string
	verificationLink: string
	bucket: IntentBucket
}

type ChapterOverride = {
	subject: (firstName: string) => string
	buildBlocks: (args: ChapterOverrideArgs) => EmailBlock[]
	/** The wrapper this chapter's email ships in, unless a caller forces one. UK
	 *  uses the stripped-down `plain` layout to match its hand-written voice; the
	 *  generic (non-override) path is always `rich`. */
	htmlStyle: OnboardingEmailHtmlStyle
}

const UK_WHATSAPP = 'https://chat.whatsapp.com/F0nj2RjLNeB1P1hyoDFsTz'
const UK_EVENTS_CALENDAR = 'https://luma.com/pauseai.uk'
const UK_INTRO_CALL = 'https://calendar.app.google/w5t7EgCFwCGKcnAS7'

// The line that introduces the numbered steps. Instead of a separate sentence
// acknowledging the join-form intent, the intent is folded into the verb here so
// the email keeps its short shape. Mirrors the buckets in copy.ts (`en.intent`).
const UK_INTRO_LINE: Record<IntentBucket, string> = {
	'keep-informed': "Here's how to stay informed with PauseAI UK:",
	'act-now': "Here's how to take an action to help:",
	volunteer: "Here's how to get involved in PauseAI UK:",
	lead: "Here's how to get involved in PauseAI UK:"
}

// Verbatim from the pre-migration PauseAI UK template, bar the verification link
// (now a real parameter), the numbered list (now an ordered `list` block), and the
// intro line (now intent-varying — see UK_INTRO_LINE).
const uk: ChapterOverride = {
	htmlStyle: 'plain',
	subject: (firstName) => `Welcome to PauseAI UK ${firstName}!`,
	buildBlocks: ({ firstName, verificationLink, bucket }) => [
		{ type: 'paragraph', text: `Hey ${firstName},` },
		{ type: 'paragraph', text: 'Welcome to our community!' },
		{ type: 'paragraph', text: UK_INTRO_LINE[bucket] },
		{
			type: 'list',
			ordered: true,
			items: [
				`[Confirm your email address](${verificationLink}) so that we can confirm it's really you signing up`,
				`Join the [PauseAI UK WhatsApp community](${UK_WHATSAPP}) and subscribe to our [UK events calendar](${UK_EVENTS_CALENDAR}).`,
				`If you'd like, [book a short call](${UK_INTRO_CALL}) with Joseph, PauseAI UK's director, so he can say hi and introduce you to the community.`
			]
		},
		{ type: 'paragraph', text: 'Looking forward to meeting you,' },
		{
			type: 'paragraph',
			text: '[Joseph](mailto:joseph@pauseai.uk) and [Matilda](mailto:matilda@pauseai.uk), the PauseAI UK Team'
		},
		{ type: 'paragraph', text: 'PS: if you have questions, just hit reply.' }
	]
}

/** Returns the override for a Members `country` value, or null for the generic
 *  copy. Match mirrors the old script's `country.includes('United Kingdom')`. */
export function getChapterOverride(
	country: string | undefined,
	language: string
): ChapterOverride | null {
	if (language === 'en' && country && country.includes('United Kingdom')) return uk
	return null
}
