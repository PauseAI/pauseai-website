// The last good copy of a public list read from CiviCRM, kept in Netlify Blobs so that an
// instance which has never read the list can still serve it while the CRM is down. Store
// only what the site already serves publicly.
import { getStore } from '@netlify/blobs'
import { crmBaseUrl } from '$lib/server/crmIntake'
import { flushReports, reportError } from '$lib/server/sentry'
import { withTimeout } from '$lib/server/withTimeout'

// Work kept alive past the response waits for this write, so a hung one must not hold it open.
const WRITE_TIMEOUT_MS = 5000

/**
 * This list's key, or null without a CRM to keep a copy for. Site-wide stores are shared by
 * every deploy context, so a deploy preview reading another CRM keeps its own copy instead of
 * replacing production's.
 */
function keyFor(name: string): string | null {
	const base = crmBaseUrl()
	return base ? `${base}/${name}` : null
}

// Opened on each call rather than once per module: Netlify sets the Blobs context per
// invocation, and leaves it out entirely in vitest, the Vite dev server and the build command.
const store = () => getStore('last-good-lists')

const isMissingContext = (error: unknown) =>
	(error as Error)?.name === 'MissingBlobsEnvironmentError'

/** Stores `value` as `name`'s last good copy, and sends the report if that fails. Never rejects. */
export async function saveLastGood(name: string, value: unknown): Promise<void> {
	const key = keyFor(name)
	if (!key) return
	try {
		await withTimeout(
			store().set(key, JSON.stringify(value)),
			WRITE_TIMEOUT_MS,
			`Writing the stored copy took over ${WRITE_TIMEOUT_MS} ms`
		)
	} catch (error) {
		if (isMissingContext(error)) return
		await reportError(error, { operation: 'lastGood.save', name })
		await flushReports()
	}
}

/**
 * `name`'s last good copy, unvalidated, or undefined when there is none or it doesn't
 * arrive within `timeoutMs`. A failure is reported but not sent. Never rejects.
 */
export async function readLastGood(name: string, timeoutMs: number): Promise<unknown> {
	const key = keyFor(name)
	if (!key) return undefined
	try {
		const serialized = await withTimeout(
			store().get(key, { type: 'text' }),
			timeoutMs,
			`Reading the stored copy took over ${timeoutMs} ms`
		)
		return serialized === null ? undefined : JSON.parse(serialized)
	} catch (error) {
		if (!isMissingContext(error)) await reportError(error, { operation: 'lastGood.read', name })
		return undefined
	}
}
