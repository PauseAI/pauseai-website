import type { FixedCopy } from './fixed.js'
import type { ChapterLink, IntentBucket, IntentGroup, OnboardingEmailHtmlStyle } from './types.js'

export type EmailBlock =
	| { type: 'heading'; text: string; level?: 1 | 2 }
	| { type: 'paragraph'; text: string }
	| { type: 'list'; items: string[]; ordered?: boolean }
	| { type: 'links'; items: ChapterLink[] }
	| { type: 'button'; text: string; url: string }
	/** The closing line and signature, set as one block so the gap above it is wider
	 *  than the gaps inside it. */
	| { type: 'signoff'; lines: string[] }
	/** A horizontal rule in the rich layout; the plain one ignores it. */
	| { type: 'rule' }

/** Everything an email supplies itself. composeBlocks() adds the fixed lines around it. */
export type EmailContent = {
	subject: string
	greeting: EmailBlock[]
	body: EmailBlock[]
	/** The closing line(s) and the sign-off. */
	signoff: EmailBlock[]
	/** The sender's own accounts. Drawn as icons in the footer, under the rule, the way
	 *  the MailerSend templates do it. */
	socials?: ChapterLink[]
	/** Unset means `rich`. */
	htmlStyle?: OnboardingEmailHtmlStyle
}

/** Maps the raw Airtable `Intent` value onto the three versions the copy varies over.
 *  Every uncertain case gets `none`, matching the live script's fallback. */
export function resolveIntentBucket(intent: string | undefined): IntentBucket {
	switch ((intent ?? '').trim()) {
		case 'Act now':
			return 'act-now'
		case 'Volunteer':
		case 'Lead':
			return 'volunteer'
		default:
			return 'none'
	}
}

export function groupOf(bucket: IntentBucket): IntentGroup {
	return bucket === 'volunteer' ? 'volunteer' : 'non-volunteer'
}

/** The skeleton: greeting, confirm link, body, newsletter line, sign-off. The two fixed
 *  lines sit at fixed positions so no content, shared or a chapter's, can leave them out. */
export function composeBlocks(
	content: EmailContent,
	fixed: FixedCopy,
	bucket: IntentBucket,
	verificationLink: string,
	/** True for an email a chapter wrote, which gets the shorter promise. */
	ownWords = false
): EmailBlock[] {
	return [
		...content.greeting,
		{ type: 'rule' },
		{ type: 'paragraph', text: fixed.confirm(verificationLink) },
		{ type: 'rule' },
		...content.body,
		{
			type: 'paragraph',
			text: ownWords ? fixed.newsletterInOwnWords : fixed.newsletter(bucket)
		},
		...content.signoff
	]
}
