import { updated } from '$app/state'
import type { BeforeNavigate } from '@sveltejs/kit'

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

/** Same path and query; the hash does not change the page. */
export function isSamePage(a: URL | Location, b: URL | Location): boolean {
	return a.pathname === b.pathname && a.search === b.search
}

/**
 * Where to send a navigation as a full page load once a newer deploy is live, or null to leave it
 * to the router. Only user navigations: a `goto` must keep its `state` and `replaceState`, which a
 * full load drops, and the router already falls back to a full load if its chunks are gone.
 */
export function fullLoadTarget(
	{ type, willUnload, from, to }: Pick<BeforeNavigate, 'type' | 'willUnload' | 'from' | 'to'>,
	isUpdated: boolean
): URL | null {
	if (!isUpdated || willUnload || !to?.url) return null
	if (type !== 'link' && type !== 'form' && type !== 'popstate') return null
	if (from && isSamePage(from.url, to.url)) return null
	return to.url
}

// A reload only helps if it fetches fresh HTML. If a cache keeps serving the old page, every load
// fails the same way, so a second reload this soon is refused and the error is shown and reported.
const RELOAD_KEY = 'stale-build-reload'
const RELOAD_GUARD_MS = 30_000

/** Reloads the page unless it was just reloaded for the same reason. Returns whether it did. */
export function reloadOnce(): boolean {
	try {
		const last = Number(sessionStorage.getItem(RELOAD_KEY))
		if (Date.now() - last < RELOAD_GUARD_MS) return false
		sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
	} catch {
		// Without storage there is no loop guard, so no reload either.
		return false
	}
	location.reload()
	return true
}
