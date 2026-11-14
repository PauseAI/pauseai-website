import { updated } from '$app/state'

// Chrome, Safari and Firefox wording for a failed dynamic import, then Vite's CSS preload error.
const CHUNK_LOAD_ERROR =
	/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/

export function isChunkLoadError(error: unknown): error is Error {
	return error instanceof Error && CHUNK_LOAD_ERROR.test(error.message)
}

/** Whether a newer deploy than the one this tab runs is live, so its old chunks are gone. */
export async function isStaleBuild(): Promise<boolean> {
	return updated.current || (await updated.check())
}

// A reload only helps if it fetches fresh HTML. If a cache keeps serving the old page, every load
// fails the same way, so a second reload this soon is refused and the error is shown and reported.
const RELOAD_KEY = 'stale-build-reload'
const RELOAD_GUARD_MS = 30_000

let reloading = false

/** Reloads the page unless it was just reloaded for the same reason. Returns whether it did. */
export function reloadOnce(): boolean {
	if (reloading) return true
	try {
		const last = Number(sessionStorage.getItem(RELOAD_KEY))
		if (Date.now() - last < RELOAD_GUARD_MS) return false
		sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
	} catch {
		// Without storage there is no loop guard, so no reload either.
		return false
	}
	reloading = true
	location.reload()
	return true
}
