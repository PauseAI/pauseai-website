// The Members row this tab's signup created, so a fresh mount of the form
// updates it instead of creating a second one: the server never matches by
// email, so the id is the only thing that prevents a duplicate. When a remount
// happens: docs/join-form-flow.md, "Resuming after a remount".
//
// sessionStorage is per tab and per top-level site, so an iframe on a chapter
// site keeps its own copy.

import { INTENTS, type Intent } from './options'

const STORAGE_KEY = 'pauseai-onboarding-signup'
// Also the lifetime of the server's continuation token, so a resumed id still
// carries a token the server accepts.
export const SIGNUP_MAX_AGE_MS = 24 * 60 * 60 * 1000

export type SavedSignup = {
	recordId: string
	// The server's proof that this tab may update the row; '' when it issued none.
	recordToken: string
	// What the row holds for the two fields every update rewrites from the post
	// (`Email subscription`, `Intent`), so a resumed form reposts them instead of
	// its unticked, unselected defaults.
	keepInformed: boolean
	intent: Intent
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
export function saveSignupFromPost(
	formData: FormData,
	recordId: string,
	recordToken: string
): void {
	saveSignup(posted(formData, 'email'), {
		recordId,
		recordToken,
		keepInformed: posted(formData, 'keep_informed') === 'on',
		intent: postedIntent(formData)
	})
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
	let stored: Partial<Stored>
	try {
		stored = (JSON.parse(storage()?.getItem(STORAGE_KEY) ?? 'null') as Partial<Stored> | null) ?? {}
	} catch {
		return null
	}
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
		intent: isIntent(stored.intent) ? stored.intent : 'None'
	}
}
