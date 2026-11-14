// The last good copy of a public list read from CiviCRM, kept in Netlify Blobs so that an
// instance which has never read the list can still serve it while the CRM is down. Store
// only what the site already serves publicly.
import { getStore, type Store } from '@netlify/blobs'
import { env } from '$env/dynamic/private'
import { reportError } from '$lib/server/sentry'

// What this instance last wrote or read, per key, so an unchanged list costs no write.
const lastSeen = new Map<string, string>()

/**
 * The store and this list's key in it, or null where Netlify provides no Blobs context
 * (vitest, the Vite dev server, the build command). The context is set per invocation,
 * so the store is opened on each call rather than once per module.
 */
function open(name: string): { store: Store; key: string } | null {
	let crmHost: string
	try {
		crmHost = new URL(env.CRM_INTAKE_URL ?? '').host
	} catch {
		return null
	}
	try {
		// Site-wide stores are shared by every deploy context, so a deploy preview reading
		// another CRM keeps its own copy instead of replacing production's.
		return { store: getStore('last-good-lists'), key: `${crmHost}/${name}` }
	} catch (error) {
		if ((error as Error)?.name !== 'MissingBlobsEnvironmentError') {
			void reportError(error, { operation: 'lastGood.open', name })
		}
		return null
	}
}

/** Stores `value` as `name`'s last good copy, unless this instance already holds it. Never rejects. */
export async function saveLastGood(name: string, value: unknown): Promise<void> {
	const opened = open(name)
	if (!opened) return
	const serialized = JSON.stringify(value)
	if (lastSeen.get(opened.key) === serialized) return
	try {
		await opened.store.set(opened.key, serialized)
		lastSeen.set(opened.key, serialized)
	} catch (error) {
		await reportError(error, { operation: 'lastGood.save', name })
	}
}

/**
 * `name`'s last good copy, unvalidated, or undefined when there is none or it doesn't
 * arrive within `timeoutMs`. Never rejects.
 */
export async function readLastGood(name: string, timeoutMs: number): Promise<unknown> {
	const opened = open(name)
	if (!opened) return undefined
	let timer: ReturnType<typeof setTimeout> | undefined
	try {
		const serialized = await Promise.race([
			opened.store.get(opened.key, { type: 'text' }),
			new Promise<never>((_, reject) => {
				timer = setTimeout(
					() => reject(new Error(`Reading the stored copy took over ${timeoutMs} ms`)),
					timeoutMs
				)
			})
		])
		if (serialized === null) return undefined
		lastSeen.set(opened.key, serialized)
		return JSON.parse(serialized)
	} catch (error) {
		await reportError(error, { operation: 'lastGood.read', name })
		return undefined
	} finally {
		clearTimeout(timer)
	}
}

export function resetLastGoodForTests(): void {
	lastSeen.clear()
}
