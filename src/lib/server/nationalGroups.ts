// The active national chapters, read from CiviCRM's chapter directory
// (PauseaiChapterDetails.publicList, with the intake API account's key; the contract is
// pauseai-civicrm's docs/intake-endpoint-plan.md, "The chapter directory") at most once
// per TTL per server instance: /api/national-groups is fetched by every onboarding form
// mount (the CDN absorbs most of those), and the onboarding emails read it on every render.
import type { NationalGroup } from '$lib/types.js'
import { callCrmRows, failureDetails } from '$lib/server/crmIntake'
import { isDev } from '$lib/env.server'
import { reportError } from '$lib/server/sentry'

const TTL_MS = 10 * 60 * 1000
// After a failed read, the last good list (or none) is served this long before
// trying again, so an outage costs one read and one Sentry event a minute.
const RETRY_AFTER_FAILURE_MS = 60 * 1000
const TIMEOUT_MS = 5000

const NO_LINKS = {
	xLink: '',
	blueskyLink: '',
	discordLink: '',
	whatsappLink: '',
	website: '',
	linktreeLink: '',
	instagramLink: '',
	tiktokLink: '',
	facebookLink: '',
	youtubeLink: '',
	linkedinLink: '',
	lumaLink: '',
	substackLink: ''
}

// Served in development when the CRM is not configured.
const FALLBACK_NATIONAL_GROUPS: NationalGroup[] = [
	{
		...NO_LINKS,
		id: '[FALLBACK DATA] Example Group 1',
		name: '[FALLBACK DATA] Example Group 1',
		leader: 'Fall McBack',
		email: 'fall.mcback@example.com',
		website: 'http://example.com',
		public: true
	},
	{
		...NO_LINKS,
		id: '[FALLBACK DATA] Example Group 2',
		name: '[FALLBACK DATA] Example Group 2',
		leader: 'etc',
		email: '',
		public: true
	}
]

const text = (value: unknown): string => (typeof value === 'string' ? value : '')

/** One publicList row. The CRM has no public chapter id, so the country stands in for one. */
function rowToNationalGroup(row: Record<string, unknown>): NationalGroup {
	const leaders = Array.isArray(row.leaders)
		? row.leaders.filter((leader): leader is string => typeof leader === 'string')
		: []
	return {
		id: text(row.country),
		name: text(row.country),
		leader: leaders.length > 0 ? leaders.join(', ') : 'No',
		email: text(row.website_email),
		xLink: text(row.x),
		blueskyLink: text(row.bluesky),
		discordLink: text(row.discord),
		whatsappLink: text(row.whatsapp),
		website: text(row.website),
		linktreeLink: text(row.linktree),
		instagramLink: text(row.instagram),
		tiktokLink: text(row.tiktok),
		facebookLink: text(row.facebook),
		youtubeLink: text(row.youtube),
		linkedinLink: text(row.linkedin),
		lumaLink: text(row.luma),
		substackLink: text(row.substack),
		public: true,
		image: text(row.image) || undefined
	}
}

let cached: { groups: NationalGroup[]; readAt: number } | null = null
let failedAt: number | null = null
let pending: Promise<NationalGroup[] | null> | null = null

async function readGroups(): Promise<NationalGroup[]> {
	const answer = await callCrmRows('PauseaiChapterDetails/publicList', {}, TIMEOUT_MS)
	if (!answer.ok) {
		if (answer.cause === 'not_configured' && isDev()) {
			console.warn('⚠️ CRM not configured, using fallback national groups in development')
			return FALLBACK_NATIONAL_GROUPS
		}
		const { cause, httpStatus } = failureDetails(answer)
		throw new Error(`Chapter directory read failed: ${cause}${httpStatus ? ` ${httpStatus}` : ''}`)
	}
	// Every page that offers a chapter would drop it, so the last good list is served instead.
	if (answer.rows.length === 0) throw new Error('Chapter directory read failed: empty list')
	return answer.rows.map(rowToNationalGroup).sort((a, b) => a.name.localeCompare(b.name))
}

async function refresh(): Promise<NationalGroup[] | null> {
	try {
		const groups = await readGroups()
		cached = { groups, readAt: Date.now() }
		failedAt = null
		return groups
	} catch (error) {
		failedAt = Date.now()
		console.error('Reading national groups failed:', error)
		await reportError(error, { operation: 'getNationalGroups', servedStale: cached !== null })
		// The last good list, however old, rather than none.
		return cached?.groups ?? null
	}
}

// Null only when no read has ever succeeded on this instance. The first caller after
// the TTL waits for the read (up to TIMEOUT_MS) rather than refreshing in the
// background, since Edge Functions may not keep a promise alive past the response.
export async function getNationalGroups(): Promise<NationalGroup[] | null> {
	const now = Date.now()
	if (cached && now - cached.readAt < TTL_MS) return cached.groups
	if (failedAt !== null && now - failedAt < RETRY_AFTER_FAILURE_MS) return cached?.groups ?? null
	pending ??= refresh().finally(() => (pending = null))
	return pending
}

export function resetNationalGroupsCacheForTests(): void {
	cached = null
	failedAt = null
	pending = null
}
