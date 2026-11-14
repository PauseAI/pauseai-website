// The active national chapters, read from CiviCRM's chapter directory
// (PauseaiChapterDetails.publicList, with the intake API account's key; the contract is
// pauseai-civicrm's docs/intake-endpoint-plan.md, "The chapter directory") at most once
// per TTL per server instance: /api/national-groups is fetched by every onboarding form
// mount (the CDN absorbs most of those), and the onboarding emails read it on every render.
import type { NationalGroup } from '$lib/types.js'
import { callCrmRows, failureDetails } from '$lib/server/crmIntake'
import { dev } from '$app/environment'
import { flushReports, reportError, reportMessage } from '$lib/server/sentry'

const TTL_MS = 10 * 60 * 1000
// After a failed read, the last good list (or none) is served this long before
// trying again, so an outage costs one read a minute.
const RETRY_AFTER_FAILURE_MS = 60 * 1000
// While reads keep failing, Sentry hears about it at most this often.
const REPORT_FAILING_EVERY_MS = 60 * 60 * 1000
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
// When the current run of failed reads began, and when it was last reported.
let failingSince: number | null = null
let failureReportedAt: number | null = null
let pending: Promise<NationalGroup[] | null> | null = null
let reportsSent: Promise<void> = Promise.resolve()

/**
 * Settles once the last report about a read has been sent. Work kept alive past the
 * response waits for it after the read, since the edge runtime may stop once that work settles.
 */
export const nationalGroupsReportsSent = (): Promise<void> => reportsSent

/** A failed read, with what may be reported about it. */
class ReadFailure extends Error {
	constructor(readonly details: Record<string, unknown>) {
		super(`Chapter directory read failed: ${String(details.cause)}`)
	}
}

async function readGroups(): Promise<NationalGroup[]> {
	const answer = await callCrmRows('PauseaiChapterDetails/publicList', {}, TIMEOUT_MS)
	if (!answer.ok) {
		// `dev` is compiled to false in any build, so a deployed site missing the CRM's
		// settings fails rather than caching example chapters.
		if (answer.cause === 'not_configured' && dev) {
			console.warn('⚠️ CRM not configured, using fallback national groups in development')
			return FALLBACK_NATIONAL_GROUPS
		}
		throw new ReadFailure(failureDetails(answer))
	}
	// Every page that offers a chapter would drop it, so the last good list is served instead.
	if (answer.rows.length === 0) throw new ReadFailure({ cause: 'empty' })
	return answer.rows.map(rowToNationalGroup).sort((a, b) => a.name.localeCompare(b.name))
}

const minutesSince = (since: number, now: number) => Math.round((now - since) / 60_000)

async function refresh(): Promise<NationalGroup[] | null> {
	let groups: NationalGroup[]
	try {
		groups = await readGroups()
	} catch (error) {
		const now = Date.now()
		failedAt = now
		failingSince ??= now
		console.error('Reading national groups failed:', error)
		if (failureReportedAt === null || now - failureReportedAt >= REPORT_FAILING_EVERY_MS) {
			failureReportedAt = now
			await reportError(error, {
				operation: 'getNationalGroups',
				servedStale: cached !== null,
				failingSince: new Date(failingSince).toISOString(),
				failingForMinutes: minutesSince(failingSince, now),
				...(error instanceof ReadFailure ? error.details : {})
			})
			// Not awaited: a caller waiting on the list should not also wait on Sentry.
			reportsSent = flushReports()
		}
		// The last good list, however old, rather than none.
		return cached?.groups ?? null
	}
	const now = Date.now()
	cached = { groups, readAt: now }
	if (failingSince !== null && failureReportedAt !== null) {
		const downForMinutes = minutesSince(failingSince, now)
		await reportMessage(`Chapter directory reads recovered after ${downForMinutes} min`, {
			operation: 'getNationalGroups',
			failingSince: new Date(failingSince).toISOString(),
			downForMinutes
		})
		reportsSent = flushReports()
	}
	failedAt = null
	failingSince = null
	failureReportedAt = null
	return groups
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
	failingSince = null
	failureReportedAt = null
	pending = null
	reportsSent = Promise.resolve()
}
