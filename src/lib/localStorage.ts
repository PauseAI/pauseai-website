import { browser } from '$app/environment'

// Access throws, rather than returning null, where site data is blocked: in some browsers
// that includes every third-party iframe, so any embed of the site.

/** Safe localStorage.getItem: null during SSR or if storage is unavailable. */
export function getItem(key: string): string | null {
	if (!browser) return null
	try {
		return localStorage.getItem(key)
	} catch {
		return null
	}
}

/** Safe localStorage.setItem: no-op during SSR or if storage is unavailable. */
export function setItem(key: string, value: string): void {
	if (!browser) return
	try {
		localStorage.setItem(key, value)
	} catch {
		// Nothing to do: the value just isn't remembered.
	}
}
