// A fixed-window counter held in this runtime's memory. Netlify runs many short-lived edge
// isolates, each with its own counters, so it slows one sender hitting one isolate but
// cannot enforce a site-wide limit. Nothing here is logged or stored beyond the window.

type Window = { count: number; resetAt: number }

const MAX_TRACKED_KEYS = 10_000

const windows = new Map<string, Window>()

function prune(now: number) {
	for (const [key, window] of windows) {
		if (window.resetAt <= now) windows.delete(key)
	}
	// Still full of live windows: forget everything rather than grow without bound.
	if (windows.size >= MAX_TRACKED_KEYS) windows.clear()
}

/** Counts one attempt. Returns the seconds to wait when over the limit, or null when allowed. */
export function takeRateLimit(
	key: string,
	limit: number,
	windowMs: number,
	now = Date.now()
): number | null {
	if (windows.size >= MAX_TRACKED_KEYS) prune(now)

	const current = windows.get(key)
	if (!current || current.resetAt <= now) {
		windows.set(key, { count: 1, resetAt: now + windowMs })
		return null
	}
	current.count += 1
	return current.count > limit ? Math.ceil((current.resetAt - now) / 1000) : null
}

export function resetRateLimits() {
	windows.clear()
}
