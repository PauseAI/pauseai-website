import { browser } from '$app/environment'

export function isDismissed(key: string): boolean {
	if (!browser) return false
	try {
		return localStorage.getItem(key) === 'true'
	} catch {
		return false
	}
}

export function dismiss(key: string): void {
	if (!browser) return
	try {
		localStorage.setItem(key, 'true')
	} catch {
		// localStorage may be unavailable in restricted contexts
	}
}
