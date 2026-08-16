// Shared date-range check for banner rules.
// Used by:
//   - Banner.svelte (SSR expiry check, imported normally)
//   - banner-selection.js (inline blocking script, injected via .toString())
//
// Vite compiles this to JS before bundling, so .toString() on the imported
// function still produces valid plain JS for the inline <script> tag.

/**
 * @param {Date} now
 * @param {string | null} startsOn  - YYYY-MM-DD or null (unbounded)
 * @param {string | null} endsOn    - YYYY-MM-DD or null (unbounded)
 * @returns {boolean} - true if `now` is within [start-of-startsOn, end-of-endsOn]
 */
export function inDateRange(now: Date, startsOn: string | null, endsOn: string | null): boolean {
	if (startsOn) {
		const s = startsOn.split('-')
		if (now < new Date(+s[0], +s[1] - 1, +s[2])) return false
	}
	if (endsOn) {
		const e = endsOn.split('-')
		if (now > new Date(+e[0], +e[1] - 1, +e[2], 23, 59, 59, 999)) return false
	}
	return true
}
