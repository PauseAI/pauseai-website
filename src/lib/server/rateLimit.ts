// A fixed-window counter held in this runtime's memory. Netlify runs many short-lived edge
// isolates, each with its own counters, so it slows one sender hitting one isolate but
// is not a hard limit, per address or site-wide: a sender reaching several isolates gets
// each one's allowance. A hard limit has to live at the platform. Nothing here is logged
// or stored beyond the window.

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

/** The seconds to wait if `key` has used up `limit`, else null. Counts nothing. */
export function peekRateLimit(key: string, limit: number, now = Date.now()): number | null {
	const current = windows.get(key)
	if (!current || current.resetAt <= now || current.count < limit) return null
	return Math.ceil((current.resetAt - now) / 1000)
}

/** Counts one use of `key`, for limits checked with peekRateLimit. */
export function recordRateLimit(key: string, windowMs: number, now = Date.now()) {
	if (windows.size >= MAX_TRACKED_KEYS) prune(now)

	const current = windows.get(key)
	if (!current || current.resetAt <= now) windows.set(key, { count: 1, resetAt: now + windowMs })
	else current.count += 1
}

/** The eight groups of an IPv6 address, or null if it is not one. */
function ipv6Groups(address: string): number[] | null {
	let text = address
	const dotted = /^(.*:)(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(address)
	if (dotted) {
		const [a, b, c, d] = dotted.slice(2).map(Number)
		if ([a, b, c, d].some((octet) => octet > 255)) return null
		text = `${dotted[1]}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`
	}

	const sides = text.split('::')
	if (sides.length > 2) return null
	const [head, tail] = [sides[0], sides[1]].map((side) => (side ? side.split(':') : []))
	const missing = 8 - head.length - tail.length
	if (sides.length === 2 ? missing < 1 : missing !== 0) return null

	const groups = [...head, ...Array<string>(missing).fill('0'), ...tail]
	if (!groups.every((group) => /^[0-9a-f]{1,4}$/.test(group))) return null
	return groups.map((group) => parseInt(group, 16))
}

/**
 * What to count a client address under. One IPv6 customer usually holds a whole /64, so
 * counting single addresses would hand them billions of counters. IPv4-mapped addresses
 * count as the IPv4 address they carry.
 */
export function rateLimitKeyForAddress(address: string): string {
	const normalised = address.trim().toLowerCase().split('%')[0]
	if (!normalised.includes(':')) return normalised

	const groups = ipv6Groups(normalised)
	if (!groups) return normalised

	const isIpv4Mapped = groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff
	if (isIpv4Mapped) {
		const [high, low] = groups.slice(6)
		return [high >> 8, high & 0xff, low >> 8, low & 0xff].join('.')
	}
	return `${groups
		.slice(0, 4)
		.map((group) => group.toString(16))
		.join(':')}::/64`
}

export function resetRateLimits() {
	windows.clear()
}
