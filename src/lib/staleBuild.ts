import { updated } from '$app/state'

// Chrome, Safari and Firefox wording for a failed dynamic import, then Vite's CSS preload error.
const CHUNK_LOAD_ERROR =
	/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/

export function isChunkLoadError(error: unknown): boolean {
	return error instanceof Error && CHUNK_LOAD_ERROR.test(error.message)
}

let pendingCheck: Promise<boolean> | undefined

/** Whether a newer deploy than the one this tab runs is live, so its old chunks are gone. */
export function isStaleBuild(): Promise<boolean> {
	if (updated.current) return Promise.resolve(true)
	// Shared, so callers resume in the order they asked: handleError decides on the reload before
	// beforeSend, which runs for the same failure's unhandled rejection, reads wasReloadRefused().
	pendingCheck ??= updated.check().finally(() => (pendingCheck = undefined))
	return pendingCheck
}

// A reload only helps if it fetches fresh HTML. If a cache keeps serving the old page, every load
// fails the same way, so a second reload this soon is refused and the error is shown and reported.
const RELOAD_KEY = 'stale-build-reload'
const RELOAD_GUARD_MS = 30_000

let reloadRefused = false

export function wasReloadRefused(): boolean {
	return reloadRefused
}

/** Reloads the page unless it was just reloaded for the same reason. Returns whether it did. */
export function reloadOnce(): boolean {
	try {
		const last = Number(sessionStorage.getItem(RELOAD_KEY))
		if (Date.now() - last < RELOAD_GUARD_MS) {
			reloadRefused = true
			return false
		}
		sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
	} catch {
		// Without storage there is no loop guard, so no reload either.
		reloadRefused = true
		return false
	}
	location.reload()
	return true
}
