import type { ChapterLink, IntentBucket, OnboardingEmailParams } from './types.js'
import type { LanguageCopy } from './copy.js'
import { SHARED } from './copy.js'
import type { ChapterBlockData } from './types.js'

export type EmailBlock =
	| { type: 'heading'; text: string }
	| { type: 'paragraph'; text: string }
	| { type: 'list'; items: string[] }
	| { type: 'links'; items: ChapterLink[] }

const KNOWN_INTENTS = new Set(['Act now', 'Keep informed', 'Volunteer', 'Lead'])

/** Maps the raw Airtable `Intent` value onto one of the 4 copy variants, falling
 *  back to `keep-informed` for empty/unrecognised values — matching the old
 *  script's "every uncertain case resolves to the [non-volunteer] email" rule. */
export function resolveIntentBucket(intent: string | undefined): IntentBucket {
	const clean = (intent ?? '').trim()
	if (!KNOWN_INTENTS.has(clean)) return 'keep-informed'
	switch (clean) {
		case 'Act now':
			return 'act-now'
		case 'Volunteer':
			return 'volunteer'
		case 'Lead':
			return 'lead'
		default:
			return 'keep-informed'
	}
}

function isVolunteering(bucket: IntentBucket): boolean {
	return bucket === 'volunteer' || bucket === 'lead'
}

export function buildEmailBlocks(
	params: OnboardingEmailParams,
	copy: LanguageCopy,
	chapter: ChapterBlockData,
	verificationLink: string,
	bucket: IntentBucket
): EmailBlock[] {
	const volunteering = isVolunteering(bucket)
	const welcomeCallsUrl =
		chapter.links.find((l) => l.label.startsWith('Events'))?.url ??
		'https://luma.com/PauseAI?tag=welcome'

	const blocks: EmailBlock[] = [
		{ type: 'heading', text: copy.greeting(params.firstName) },
		{ type: 'paragraph', text: copy.verifyLine(verificationLink) },
		{ type: 'paragraph', text: copy.ignoreNote },
		{ type: 'paragraph', text: copy.intent[bucket] },
		{
			type: 'paragraph',
			text: `${copy.videoIntro} [${copy.videoLinkText}](${SHARED.VIDEO_URL})`
		},
		{ type: 'heading', text: copy.connectHeading },
		{
			type: 'paragraph',
			text: chapter.isGlobalFallback
				? copy.connectFallbackIntro
				: copy.connectFoundIntro(chapter.name, chapter.leader)
		},
		{ type: 'paragraph', text: copy.welcomeCallsLine(welcomeCallsUrl) }
	]

	if (chapter.links.length > 0) {
		blocks.push({ type: 'links', items: chapter.links })
	}

	blocks.push(
		{ type: 'heading', text: copy.howWeCreateChangeHeading },
		{ type: 'paragraph', text: copy.howWeCreateChangeIntro },
		{
			type: 'paragraph',
			text: volunteering
				? copy.howWeCreateChangeVolunteerLine
				: copy.howWeCreateChangeNonVolunteerLine
		},
		{ type: 'list', items: copy.howWeCreateChangeListItems },
		{ type: 'paragraph', text: copy.howWeCreateChangeClosing },
		{ type: 'heading', text: copy.whatsNextHeading },
		{ type: 'paragraph', text: copy.whatsNextP1 },
		{ type: 'paragraph', text: copy.whatsNextP2 },
		{ type: 'paragraph', text: copy.whatsNextClosing },
		{
			type: 'paragraph',
			text: chapter.isGlobalFallback
				? copy.signoffFallback
				: copy.signoffFound(chapter.leader, chapter.name)
		}
	)

	return blocks
}
