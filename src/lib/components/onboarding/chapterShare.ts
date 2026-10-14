// The chapter-sharing question on /join, the browse signup and /subscribe, and the
// copy that depends on its answer. Rules: docs/join-form-flow.md, "Chapter sharing".
import type { NationalGroupsApiResponse } from '$api/national-groups/+server.js'
import { onboardingMessages, type OnboardingMessages } from './messages'
import { asksChapterQuestion, type ChapterAnswer } from './options'

const CHOSEN_PREFIX = '[chosen] '

// 'chapter-site' replaces 'join' while embedded on that same chapter's own
// site (detected by matching the iframe's referrer host against the chapter's
// website field, OnboardingFlow.svelte's isChapterSiteQuestion). There the
// question is a single checkbox, not a yes/no choice: it also stands in for
// the Privacy Policy consent otherwise asked separately, and there's no
// "chapter only" opt-out — checked shares with both, unchecked shares with
// neither (blocks the signup entirely, same as declining the checkbox
// elsewhere). Its `heading`/`body` are empty: nothing is shown above the
// checkbox, and chapterShareWording skips them in the stored evidence.
export type ChapterForm = 'join' | 'subscribe' | 'chapter-site'

export type ChapterQuestion = { heading: string; body: string; yes: string; no: string }

// The National Chapters table names a chapter only by its country, so a chapter
// whose own name is not "PauseAI <country>" is listed here, keyed by that country.
// Add one when a chapter goes by another name: the name is part of the wording
// stored on each record, so it must be the one the chapter uses.
const CHAPTER_DISPLAY_NAMES: Record<string, string> = {
	Germany: 'PauseAI Deutschland',
	Sweden: 'PauseAI Sverige',
	'United Kingdom': 'PauseAI UK'
}

// `chapter` is the chapter's name where the country has one, or null where it has
// none yet.
export function chapterName(country: string, chapterCountries: string[]): string | null {
	const trimmed = country.trim()
	const match = chapterCountries.find((name) => name.toLowerCase() === trimmed.toLowerCase())
	if (!match) return null
	return CHAPTER_DISPLAY_NAMES[match] ?? `PauseAI ${trimmed}`
}

// /subscribe's Yes also covers email, since nothing else on that form names the
// chapter as a sender; /join leaves chapter mail to Keep me informed.
export function chapterQuestion(
	msgs: OnboardingMessages,
	form: ChapterForm,
	country: string,
	chapter: string | null
): ChapterQuestion | null {
	if (!asksChapterQuestion(country)) return null
	const subscribe = form === 'subscribe'
	if (chapter) {
		if (form === 'chapter-site') {
			return {
				heading: '',
				body: '',
				yes: msgs.onboarding_chapter_site_label(chapter),
				no: msgs.onboarding_chapter_no
			}
		}
		return {
			heading: subscribe
				? msgs.onboarding_chapter_subscribe_heading(chapter)
				: msgs.onboarding_chapter_heading(chapter),
			body: msgs.onboarding_chapter_body(chapter),
			yes: subscribe
				? msgs.onboarding_chapter_subscribe_yes(chapter)
				: msgs.onboarding_chapter_yes(chapter),
			no: msgs.onboarding_chapter_no
		}
	}
	return {
		heading: subscribe
			? msgs.onboarding_chapter_none_subscribe_heading(country)
			: msgs.onboarding_chapter_none_heading(country),
		body: msgs.onboarding_chapter_none_body(country),
		yes: subscribe ? msgs.onboarding_chapter_none_subscribe_yes : msgs.onboarding_chapter_none_yes,
		no: msgs.onboarding_chapter_no
	}
}

// What `GDPR chapter share wording` stores: the text the person saw, with the
// option they picked, in the language it was shown in. Laid out as in the mock-up
// the wording was agreed on. Empty heading/body (chapter-site's single checkbox,
// which shows neither) are left out rather than stored as blank lines.
export function chapterShareWording(question: ChapterQuestion, answer: ChapterAnswer): string {
	const chosen = `${CHOSEN_PREFIX}${answer === 'yes' ? question.yes : question.no}`
	return [question.heading, question.body, chosen].filter(Boolean).join('\n')
}

// Every wording a form can show for `country` and store with `answer`, in each
// locale: naming the chapter as the form would if its list has one for `country`,
// or as the none-yet variant. Independent of any chapter list, so a form and the
// server holding different copies of it cannot disagree. The server stores a
// posted wording only if it is one of these.
export function possibleWordings(
	forms: readonly ChapterForm[],
	country: string,
	answer: ChapterAnswer
): string[] {
	const names = [chapterName(country, [country]), null]
	return Object.values(onboardingMessages).flatMap((msgs) =>
		forms.flatMap((form) =>
			names.flatMap((name) => {
				const question = chapterQuestion(msgs, form, country, name)
				return question ? [chapterShareWording(question, answer)] : []
			})
		)
	)
}

// The answer the copy below the question follows. Where the question is not asked
// (the United States), the copy is the not-shared one.
export function effectiveAnswer(
	country: string,
	answer: ChapterAnswer | null
): ChapterAnswer | null {
	return asksChapterQuestion(country) ? answer : 'no'
}

export function keepInformedSub(
	msgs: OnboardingMessages,
	answer: ChapterAnswer | null,
	chapter: string | null
): string {
	if (answer === 'no') return msgs.onboarding_keep_informed_sub_not_shared
	if (answer === 'yes') return msgs.onboarding_keep_informed_sub_shared(chapter)
	return msgs.onboarding_keep_informed_sub_unanswered(chapter)
}

// Who follows up one to one on a Volunteer or Lead request, appended to their
// option's sub-line.
export function inTouch(
	msgs: OnboardingMessages,
	answer: ChapterAnswer | null,
	chapter: string | null
): string {
	if (answer === 'no') return msgs.onboarding_in_touch_not_shared
	if (answer === 'yes') return msgs.onboarding_in_touch_shared(chapter)
	return msgs.onboarding_in_touch_unanswered
}

export function keepInformedConfirmation(
	msgs: OnboardingMessages,
	answer: ChapterAnswer | null,
	chapter: string | null
): string {
	return answer === 'yes'
		? msgs.onboarding_confirm_keep_informed_shared(chapter)
		: msgs.onboarding_confirm_keep_informed_not_shared
}

// The national groups list, fetched once per page load. A failed or slow lookup
// counts as no chapters, as the lead path's copy already does: the question waits
// for it, so a hung request must not leave Submit disabled.
const CHAPTER_LOOKUP_TIMEOUT_MS = 5000
let nationalGroupsPromise: Promise<NationalGroupsApiResponse> | null = null

function loadNationalGroups(): Promise<NationalGroupsApiResponse> {
	nationalGroupsPromise ??= Promise.race([
		fetch('/api/national-groups')
			.then((response) =>
				response.ok ? (response.json() as Promise<NationalGroupsApiResponse>) : []
			)
			.catch(() => []),
		new Promise<NationalGroupsApiResponse>((resolve) =>
			setTimeout(() => resolve([]), CHAPTER_LOOKUP_TIMEOUT_MS)
		)
	])
	return nationalGroupsPromise
}

export function loadChapterCountries(): Promise<string[]> {
	return loadNationalGroups().then((groups) => groups.map((group) => group.name))
}

function hostOf(url: string): string | null {
	try {
		return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname
			.replace(/^www\./, '')
			.toLowerCase()
	} catch {
		return null
	}
}

// The chapter, if any, whose own website matches `host` — the iframe's
// referrer host when the embed is on a chapter's own site. Null for the
// global site, an unknown host, or a chapter with no website on record.
export function loadChapterSiteCountry(host: string): Promise<string | null> {
	const cleanHost = host.replace(/^www\./, '').toLowerCase()
	if (!cleanHost) return Promise.resolve(null)
	return loadNationalGroups().then((groups) => {
		const match = groups.find((group) => group.website && hostOf(group.website) === cleanHost)
		return match?.name ?? null
	})
}
