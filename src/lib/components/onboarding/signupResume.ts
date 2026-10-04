// The Members row this tab's signup created, so a fresh mount of the form
// updates it instead of creating a second one: the server never matches by
// email, so the id is the only thing that prevents a duplicate. When a remount
// happens: docs/join-form-flow.md, "Resuming after a remount".
//
// sessionStorage is per tab and per top-level site, so an iframe on a chapter
// site keeps its own copy.

import {
	INTENTS,
	asksChapterQuestion,
	isChapterAnswer,
	type ChapterAnswer,
	type Intent
} from './options'
import { SIGNUP_MAX_AGE_MS } from './signupMaxAge'

const STORAGE_KEY = 'pauseai-onboarding-signup'

export type SavedSignup = {
	recordId: string
	// The server's proof that this tab may update the row; '' when it issued none.
	recordToken: string
	// What the row holds for the two fields every update rewrites from the post
	// (`Email subscription`, `Intent`), so a resumed form reposts them instead of
	// its unticked, unselected defaults.
	keepInformed: boolean
	intent: Intent
	// The chapter-sharing answer the row holds and the country it was given for, so
	// a resumed form does not ask again for that country; null when it holds none (a
	// US signup, or a row from before the question).
	chapterAnswer: SavedChapterAnswer | null
}

export type SavedChapterAnswer = { answer: ChapterAnswer; country: string }

// The saved answer only counts for the country it was given for: another country
// has another chapter, so the question is asked again.
export function chapterAnswerFor(
	saved: SavedChapterAnswer | null,
	country: string
): ChapterAnswer | null {
	return saved && saved.country.trim().toLowerCase() === country.trim().toLowerCase()
		? saved.answer
		: null
}

// The answer a picked-up row holds counts only while the form's email is still the
// one it was picked up for: another email starts a row of its own (see
// startOverUnlessFor in OnboardingFlow), which must be asked.
export function heldChapterAnswer(
	held: SavedChapterAnswer | null,
	pickedUpFor: string | null,
	email: string,
	country: string
): ChapterAnswer | null {
	if (pickedUpFor === null || !sameEmail(pickedUpFor, email)) return null
	return chapterAnswerFor(held, country)
}

function isSavedChapterAnswer(value: unknown): value is SavedChapterAnswer {
	if (typeof value !== 'object' || value === null) return false
	const { answer, country } = value as Record<string, unknown>
	return isChapterAnswer(answer) && typeof country === 'string'
}

type Stored = SavedSignup & { email: string; savedAt: number }

const normalise = (email: string) => email.trim().toLowerCase()

export const sameEmail = (a: string, b: string) => normalise(a) === normalise(b)

const isIntent = (value: unknown): value is Intent => INTENTS.some((intent) => intent === value)

export function posted(formData: FormData, name: string): string {
	const value = formData.get(name)
	return typeof value === 'string' ? value : ''
}

function storage(): Storage | null {
	try {
		return typeof sessionStorage === 'undefined' ? null : sessionStorage
	} catch {
		// Access throws when site data is blocked.
		return null
	}
}

export function saveSignup(email: string, signup: SavedSignup, now = Date.now()): void {
	const stored: Stored = { ...signup, email: normalise(email), savedAt: now }
	try {
		storage()?.setItem(STORAGE_KEY, JSON.stringify(stored))
	} catch {
		// Best-effort: without it a remount creates a row, as before.
	}
}

export function postedIntent(formData: FormData): Intent {
	const intent = posted(formData, 'intent')
	return isIntent(intent) ? intent : 'None'
}

// After a post that returned `recordId`: what that post wrote is what the row holds.
// A post without a chapter answer left the row's alone, so `held`, the answer the
// row held before it, stands, except in the United States, where the server clears
// it. Returns the answer the row now holds, which the form must take as its own:
// asking again or not for a country follows it.
export function saveSignupFromPost(
	formData: FormData,
	recordId: string,
	recordToken: string,
	held: SavedChapterAnswer | null
): SavedChapterAnswer | null {
	const answer = posted(formData, 'chapter_share')
	const country = posted(formData, 'country')
	const chapterAnswer = !asksChapterQuestion(country)
		? null
		: isChapterAnswer(answer)
			? { answer, country }
			: held
	saveSignup(posted(formData, 'email'), {
		recordId,
		recordToken,
		keepInformed: posted(formData, 'keep_informed') === 'on',
		intent: postedIntent(formData),
		chapterAnswer
	})
	return chapterAnswer
}

function readStored(): Partial<Stored> {
	try {
		return (JSON.parse(storage()?.getItem(STORAGE_KEY) ?? 'null') as Partial<Stored> | null) ?? {}
	} catch {
		return {}
	}
}

// Where the form goes after a 410, which drops the id: the next post creates a
// row, and that needs the privacy consent again. The browse form posts its own
// and can retry; the contact flow collects it on step 1-2; a /subscribe
// continuation hides it, so it hands back to the subscribe form.
export function afterRecordGone(
	mode: 'contact' | 'browse',
	isContinuation: boolean
): 'retry' | 'step-1' | 'signup-form' {
	if (mode === 'browse') return 'retry'
	return isContinuation ? 'signup-form' : 'step-1'
}

// Where the form goes when the server finds no chapter answer for the row's country
// (the row's answer is for another country, or it holds none): back to the question.
// The browse form shows it itself; the contact flow asks it on step 1; a /subscribe
// continuation, which has no step 1, asks it on its intent step.
export function afterChapterAnswerMissing(
	mode: 'contact' | 'browse',
	isContinuation: boolean
): 'stay' | 'step-1' | 'step-2' {
	if (mode === 'browse') return 'stay'
	return isContinuation ? 'step-2' : 'step-1'
}

// Drops the stored answer, keeping the row: the server says it does not hold one for
// the country posted, so a remount must ask again.
export function forgetChapterAnswer(): void {
	const stored = readStored()
	if (typeof stored.recordId !== 'string') return
	try {
		storage()?.setItem(STORAGE_KEY, JSON.stringify({ ...stored, chapterAnswer: null }))
	} catch {
		// Best-effort, as saveSignup.
	}
}

export function forgetSignup(): void {
	try {
		storage()?.removeItem(STORAGE_KEY)
	} catch {
		// Nothing to clear.
	}
}

// Only for the same address: someone else signing up in the same tab must get
// their own row, not overwrite the first person's.
export function loadSignup(email: string, now = Date.now()): SavedSignup | null {
	if (!email.trim()) return null
	const stored = readStored()
	if (
		typeof stored.recordId !== 'string' ||
		!stored.recordId ||
		stored.email !== normalise(email) ||
		typeof stored.savedAt !== 'number' ||
		now - stored.savedAt > SIGNUP_MAX_AGE_MS
	) {
		return null
	}
	return {
		recordId: stored.recordId,
		recordToken: typeof stored.recordToken === 'string' ? stored.recordToken : '',
		keepInformed: stored.keepInformed === true,
		intent: isIntent(stored.intent) ? stored.intent : 'None',
		chapterAnswer: isSavedChapterAnswer(stored.chapterAnswer) ? stored.chapterAnswer : null
	}
}
