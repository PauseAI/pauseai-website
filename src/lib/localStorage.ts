import { browser } from '$app/environment'

/** Safe localStorage.getItem — returns null during SSR or if storage is unavailable. */
export function getItem(key: string): string | null {
	if (!browser) return null
	try {
		return localStorage.getItem(key)
	} catch {
		return null
	}
}

/** Safe localStorage.setItem — no-op during SSR or if storage is unavailable. */
export function setItem(key: string, value: string): void {
	if (!browser) return
	try {
		localStorage.setItem(key, value)
	} catch {
		// localStorage may be unavailable in restricted contexts
	}
}
