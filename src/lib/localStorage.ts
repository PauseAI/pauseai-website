import { browser } from '$app/environment'

/** Safe localStorage.setItem — no-op during SSR or if storage is unavailable. */
export function setItem(key: string, value: string): void {
	if (!browser) return
	try {
		localStorage.setItem(key, value)
	} catch {
		// localStorage may be unavailable in restricted contexts
	}
}
