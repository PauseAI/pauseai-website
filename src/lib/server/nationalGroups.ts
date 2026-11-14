// The active national chapters, read from CiviCRM's chapter directory
// (PauseaiChapterDetails.publicList, with the intake API account's key; the contract is
// pauseai-civicrm's docs/intake-endpoint-plan.md, "The chapter directory") at most once
// per TTL per server instance: /api/national-groups is fetched by every onboarding form
// mount (the CDN absorbs most of those), and the onboarding emails read it on every render.
import type { NationalGroup } from '$lib/types.js'
import { callCrmRows, failureDetails, isRow } from '$lib/server/crmIntake'
import { dev } from '$app/environment'
import { flushReports, reportError, reportMessage } from '$lib/server/sentry'
import { readLastGood, saveLastGood } from '$lib/server/lastGood'

const TTL_MS = 10 * 60 * 1000
// After a failed read, the last good list (or none) is served this long before
// trying again, so an outage costs one read a minute.
const RETRY_AFTER_FAILURE_MS = 60 * 1000
// The first failed read of an outage is reported at once, then at most this often.
const REPORT_FAILING_EVERY_MS = 60 * 60 * 1000
const TIMEOUT_MS = 5000
// The welcome render waits CHAPTER_READ_TIMEOUT_MS (onboardingEmail/chapter.ts) for the
// whole read, so after a fast CRM failure the stored copy must still arrive inside that.
const STORED_COPY_TIMEOUT_MS = 1000
const STORED_COPY = 'chapters'

// Served in development when the CRM is not configured.
const FALLBACK_ROWS: Record<string, unknown>[] = [
	{
		country: '[FALLBACK DATA] Example Group 1',
		leaders: ['Fall McBack'],
		website_email: 'fall.mcback@example.com',
		website: 'http://example.com'
	},
	{ country: '[FALLBACK DATA] Example Group 2', leaders: ['etc'] }
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

const toGroups = (rows: Record<string, unknown>[]): NationalGroup[] =>
	rows.map(rowToNationalGroup).sort((a, b) => a.name.localeCompare(b.name))

/** The stored copy, or null if it isn't a non-empty list of rows. */
const asStoredRows = (value: unknown): Record<string, unknown>[] | null =>
	Array.isArray(value) && value.length > 0 && value.every(isRow) ? value : null

// A stored copy is cached with readAt -Infinity, so it is never fresh and is replaced by
// the next good read.
let cached: { groups: NationalGroup[]; readAt: number } | null = null
let outage: { since: number; lastFailedAt: number; reportedAt: number } | null = null
let pending: Promise<NationalGroup[] | null> | null = null
let backgroundWork: Promise<void> = Promise.resolve()

/**
 * Settles once the reports and the stored-copy write the last refresh started are done. Take
 * it after the read settles: work kept alive past the response waits for it, since the edge
 * runtime may stop once that work settles.
 */
export const nationalGroupsBackgroundWork = (): Promise<void> => backgroundWork

/** A failed read, with what may be reported about it. */
class ReadFailure extends Error {
	constructor(readonly details: Record<string, unknown>) {
		super(`Chapter directory read failed: ${String(details.cause)}`)
	}
}

async function readRows(): Promise<Record<string, unknown>[]> {
	const answer = await callCrmRows('PauseaiChapterDetails/publicList', {}, TIMEOUT_MS)
	if (!answer.ok) {
		// `dev` is compiled to false in any build, so a deployed site missing the CRM's
		// settings fails rather than caching example chapters.
		if (answer.cause === 'not_configured' && dev) {
			console.warn('⚠️ CRM not configured, using fallback national groups in development')
			return FALLBACK_ROWS
		}
		throw new ReadFailure(failureDetails(answer))
	}
	// Every page that offers a chapter would drop it, so the last good list is served instead.
	if (answer.rows.length === 0) throw new ReadFailure({ cause: 'empty' })
	return answer.rows
}

const outageFields = (since: number, now: number) => ({
	operation: 'getNationalGroups',
	failingSince: new Date(since).toISOString(),
	failingForMinutes: Math.round((now - since) / 60_000)
})

/** Reads the list, adding the work it starts to `work`. */
async function readAndRecord(work: Promise<void>[]): Promise<NationalGroup[] | null> {
	let rows: Record<string, unknown>[]
	try {
		rows = await readRows()
	} catch (error) {
		const now = Date.now()
		outage ??= { since: now, lastFailedAt: now, reportedAt: -Infinity }
		outage.lastFailedAt = now
		console.error('Reading national groups failed:', error)
		const readStored = cached === null
		if (readStored) {
			const storedRows = asStoredRows(await readLastGood(STORED_COPY, STORED_COPY_TIMEOUT_MS))
			if (storedRows) cached = { groups: toGroups(storedRows), readAt: -Infinity }
		}
		const report = now - outage.reportedAt >= REPORT_FAILING_EVERY_MS
		if (report) {
			outage.reportedAt = now
			const servedStoredCopy = cached?.readAt === -Infinity
			await reportError(error, {
				...outageFields(outage.since, now),
				servedStale: cached !== null && !servedStoredCopy,
				servedStoredCopy,
				...(error instanceof ReadFailure ? error.details : {})
			})
		}
		// Not awaited: a caller waiting on the list should not also wait on Sentry.
		if (report || readStored) work.push(flushReports())
		// The last good list, however old, rather than none.
		return cached?.groups ?? null
	}
	const now = Date.now()
	const groups = toGroups(rows)
	cached = { groups, readAt: now }
	// The CRM's publicList rows hold only fields the site serves.
	work.push(saveLastGood(STORED_COPY, rows))
	if (outage) {
		await reportMessage('Chapter directory reads recovered', outageFields(outage.since, now))
		work.push(flushReports())
		outage = null
	}
	return groups
}

async function refresh(): Promise<NationalGroup[] | null> {
	const work: Promise<void>[] = []
	try {
		return await readAndRecord(work)
	} finally {
		backgroundWork = Promise.all(work).then(() => {})
	}
}

// Null only when no read has ever succeeded on this instance. The first caller after
// the TTL waits for the read (up to TIMEOUT_MS) rather than refreshing in the
// background, since Edge Functions may not keep a promise alive past the response.
export async function getNationalGroups(): Promise<NationalGroup[] | null> {
	const now = Date.now()
	if (cached && now - cached.readAt < TTL_MS) return cached.groups
	// Before the retry shortcut: a refresh records the outage before its stored-copy read.
	if (pending) return pending
	if (outage && now - outage.lastFailedAt < RETRY_AFTER_FAILURE_MS) return cached?.groups ?? null
	pending = refresh().finally(() => (pending = null))
	return pending
}

export function resetNationalGroupsCacheForTests(): void {
	cached = null
	outage = null
	pending = null
	backgroundWork = Promise.resolve()
}
