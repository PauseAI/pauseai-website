/**
 * Collagen UID handling for tracking collage participants.
 *
 * UIDs are stored in localStorage to personalize the experience for users who
 * arrived via email tracking links (validate/subscribe/share actions).
 *
 * Future: UID can be sent to server endpoints to query tracking DB for
 * personalized collage rendering (position highlighting, etc).
 */

/**
 * Get collagen UID from localStorage for a campaign.
 *
 * @param campaign Campaign name (e.g., "sayno")
 * @returns UID string or null if not found
 */
export function getCollagenUid(campaign: string): string | null {
	if (typeof localStorage === 'undefined') return null

	const key = `collagen_uid_${campaign}`
	return localStorage.getItem(key)
}

/**
 * Store collagen UID in localStorage for a campaign.
 *
 * @param campaign Campaign name (e.g., "sayno")
 * @param uid User's tracking UID
 */
export function setCollagenUid(campaign: string, uid: string): void {
	if (typeof localStorage === 'undefined') return

	const key = `collagen_uid_${campaign}`
	localStorage.setItem(key, uid)
}

/**
 * Check if user has a collagen UID for a campaign.
 *
 * @param campaign Campaign name (e.g., "sayno")
 * @returns true if UID exists
 */
export function hasCollagenUid(campaign: string): boolean {
	return getCollagenUid(campaign) !== null
}

/**
 * Detect collagen UID from URL params and store if found.
 * Only returns true if UID is present in current URL (not from localStorage).
 *
 * @param campaign Campaign name (e.g., "sayno")
 * @param searchParams URLSearchParams from page.url.searchParams
 * @returns true if UID found in URL params (and stored), false otherwise
 */
export function detectAndStoreCollagenUid(
	campaign: string,
	searchParams: URLSearchParams
): boolean {
	const paramKey = `collagen_uid_${campaign}`
	const uidParam = searchParams.get(paramKey)

	if (uidParam) {
		setCollagenUid(campaign, uidParam)
		return true
	}

	return false
}
