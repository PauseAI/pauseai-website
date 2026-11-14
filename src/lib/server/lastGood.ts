// The last good copy of a public list read from CiviCRM, kept in Netlify Blobs so that an
// instance which has never read the list can still serve it while the CRM is down. Store
// only what the site already serves publicly.
import { getStore, type Store } from '@netlify/blobs'
import { crmBaseUrl } from '$lib/server/crmIntake'
import { flushReports, reportError } from '$lib/server/sentry'
import { withTimeout } from '$lib/server/withTimeout'

// Work kept alive past the response waits for this write, so a hung one must not hold it open.
const WRITE_TIMEOUT_MS = 5000

/**
 * The store and this list's key in it, or null where Netlify provides no Blobs context
 * (vitest, the Vite dev server, the build command). The context is set per invocation,
 * so the store is opened on each call rather than once per module.
 */
function open(name: string): { store: Store; key: string } | null {
	const base = crmBaseUrl()
	if (!base) return null
	try {
		// Site-wide stores are shared by every deploy context, so a deploy preview reading
		// another CRM keeps its own copy instead of replacing production's.
		return { store: getStore('last-good-lists'), key: `${base}/${name}` }
	} catch (error) {
		if ((error as Error)?.name !== 'MissingBlobsEnvironmentError') {
			void reportError(error, { operation: 'lastGood.open', name })
		}
		return null
	}
}

/** Stores `value` as `name`'s last good copy, and sends the report if that fails. Never rejects. */
export async function saveLastGood(name: string, value: unknown): Promise<void> {
	const opened = open(name)
	if (!opened) return
	try {
		await withTimeout(
			opened.store.set(opened.key, JSON.stringify(value)),
			WRITE_TIMEOUT_MS,
			`Writing the stored copy took over ${WRITE_TIMEOUT_MS} ms`
		)
	} catch (error) {
		await reportError(error, { operation: 'lastGood.save', name })
		await flushReports()
	}
}

/**
 * `name`'s last good copy, unvalidated, or undefined when there is none or it doesn't
 * arrive within `timeoutMs`. A failure is reported but not sent. Never rejects.
 */
export async function readLastGood(name: string, timeoutMs: number): Promise<unknown> {
	const opened = open(name)
	if (!opened) return undefined
	try {
		const serialized = await withTimeout(
			opened.store.get(opened.key, { type: 'text' }),
			timeoutMs,
			`Reading the stored copy took over ${timeoutMs} ms`
		)
		return serialized === null ? undefined : JSON.parse(serialized)
	} catch (error) {
		await reportError(error, { operation: 'lastGood.read', name })
		return undefined
	}
}
