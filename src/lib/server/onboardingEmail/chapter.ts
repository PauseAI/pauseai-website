import type { NationalGroup, NationalGroupLink } from '$lib/types.js'
import { getNationalGroups, nationalGroupsBackgroundWork } from '$lib/server/nationalGroups'
import { withTimeout } from '$lib/server/withTimeout'
import type { ChapterBlockData, ChapterLink, WaitUntil } from './types.js'

// The CRM gives the v2 welcome render 10 seconds (pauseai-civicrm's SignupMail::RENDER_URL),
// so a slow chapter list must give up well inside that and never fail the render.
export const CHAPTER_READ_TIMEOUT_MS = 3000

// PauseAI US is a separate organisation that onboards its own members, so its signups are
// treated like a country without a chapter.
const NOT_ONBOARDED_BY_GLOBAL = new Set(['united states'])

// Field -> display label, in the fixed order links should render.
const LINK_FIELDS: { field: NationalGroupLink; label: string }[] = [
	{ field: 'website', label: 'Website' },
	{ field: 'discordLink', label: 'Discord' },
	{ field: 'whatsappLink', label: 'WhatsApp' },
	{ field: 'lumaLink', label: 'Events' },
	{ field: 'substackLink', label: 'Substack' },
	{ field: 'xLink', label: 'X' },
	{ field: 'blueskyLink', label: 'Bluesky' },
	{ field: 'instagramLink', label: 'Instagram' },
	{ field: 'tiktokLink', label: 'TikTok' },
	{ field: 'facebookLink', label: 'Facebook' },
	{ field: 'youtubeLink', label: 'YouTube' },
	{ field: 'linkedinLink', label: 'LinkedIn' },
	{ field: 'linktreeLink', label: 'Linktree' }
]

/** The platform's waitUntil, or undefined without one (the Node dev server). */
export function platformWaitUntil(platform: App.Platform | undefined): WaitUntil | undefined {
	return platform && ((promise) => platform.context.waitUntil(promise))
}

function normalizeCountry(country: string): string {
	return country.trim().toLowerCase()
}

/**
 * These are free-text fields a dozen people edit, so a value is taken only when it is a web
 * link, and a missing scheme is assumed rather than dropped: "chat.whatsapp.com/x" is a
 * chapter's real link typed without the https, and silently losing it is worse than adding it.
 * Anything else, including a javascript: or mailto: value, is dropped rather than put in an href.
 */
function webLink(value: unknown): string {
	const trimmed = typeof value === 'string' ? value.trim() : ''
	const url = /^https?:\/\//i.test(trimmed)
		? trimmed
		: /^[\w-]+(\.[\w-]+)+(\/|$)/.test(trimmed)
			? `https://${trimmed}`
			: ''
	// A bracket would end the markdown link early, leaving a dead href and the rest of the URL
	// as visible text, so encode both rather than dropping an otherwise valid link.
	return url.replaceAll('(', '%28').replaceAll(')', '%29')
}

function groupToChapterBlock(group: NationalGroup): ChapterBlockData {
	const links: ChapterLink[] = LINK_FIELDS.map(({ field, label }) => ({
		label,
		url: webLink(group[field])
	})).filter((link) => link.url.length > 0)

	return { name: group.name.trim(), links }
}

/**
 * The cached chapter list (src/lib/server/nationalGroups.ts). Throws when no list can be
 * read, or none arrives within CHAPTER_READ_TIMEOUT_MS. The read, and any work it starts,
 * are handed to `waitUntil`, so the runtime keeps them alive past the response: a read cut
 * short still fills the cache for the next email.
 */
async function readChapters(waitUntil?: WaitUntil): Promise<NationalGroup[]> {
	const read = getNationalGroups()
	try {
		waitUntil?.(read.then(nationalGroupsBackgroundWork))
	} catch (error) {
		console.warn('Could not keep the chapter list read alive:', (error as Error)?.name)
	}
	const groups = await withTimeout(
		read,
		CHAPTER_READ_TIMEOUT_MS,
		`Chapter list read took over ${CHAPTER_READ_TIMEOUT_MS} ms`
	)
	if (!groups) throw new Error('The chapter list could not be read')
	return groups
}

/**
 * Looks up the active chapter matching `country` (exact, case-insensitive match against the
 * chapter's country, which /api/national-groups exposes as `NationalGroup.name`). Null when
 * there is no chapter to point the reader at. Throws when the chapter list cannot be read.
 */
export async function lookupChapterForOnboardingEmail(
	country: string | undefined,
	waitUntil?: WaitUntil
): Promise<ChapterBlockData | null> {
	const cleanCountry = normalizeCountry(country ?? '')
	if (!cleanCountry || NOT_ONBOARDED_BY_GLOBAL.has(cleanCountry)) return null

	const match = (await readChapters(waitUntil)).find(
		(group) => normalizeCountry(group.name) === cleanCountry
	)
	return match ? groupToChapterBlock(match) : null
}

/** As lookupChapterForOnboardingEmail, but null when the chapter list cannot be read. */
export async function getChapterForOnboardingEmail(
	country: string | undefined,
	waitUntil?: WaitUntil
): Promise<ChapterBlockData | null> {
	// A CRM outage renders the email without its chapter block rather than failing it.
	try {
		return await lookupChapterForOnboardingEmail(country, waitUntil)
	} catch (error) {
		console.error('Chapter lookup failed, rendering without a chapter:', error)
		return null
	}
}

/**
 * The countries that currently resolve to a chapter block (active chapters), sorted. Exposed
 * for the onboarding-email preview tool's country picker; the render path itself matches
 * free-text, not this list.
 */
export async function listActiveChapterCountries(waitUntil?: WaitUntil): Promise<string[]> {
	let groups: NationalGroup[]
	try {
		groups = await readChapters(waitUntil)
	} catch (error) {
		console.error('Chapter lookup failed, listing no countries:', error)
		return []
	}

	return groups
		.map((group) => group.name.trim())
		.filter(
			(country) => country.length > 0 && !NOT_ONBOARDED_BY_GLOBAL.has(normalizeCountry(country))
		)
		.sort((a, b) => a.localeCompare(b))
}
