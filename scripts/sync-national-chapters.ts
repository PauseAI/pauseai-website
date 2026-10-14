/**
 * Syncs src/lib/data/national-chapters.json with the national groups
 * served by https://pauseai.info/api/national-groups (backed by the Airtable
 * "National groups" table).
 *
 * Behavior:
 * - Chapters already present in the JSON are preserved verbatim: their
 *   coordinates and country_local labels were hand-picked and the API has
 *   neither, so they are never regenerated.
 * - Chapters whose link changed are updated. Changes are non-invasive: only
 *   outdated values are touched, never the ordering of existing entries.
 * - When a group has a Luma page (the `luma` field in Airtable), the page is
 *   fetched to resolve its calendar API ID (cal-…), stored as lumaCalendarId —
 *   the ID that /api/calendar needs to pull the chapter's events via Luma's
 *   get-items API. The Luma URL itself is not stored. A failed resolution
 *   keeps the previously stored ID, so a transient Luma hiccup can never wipe
 *   known-good data.
 * - Countries that are new to the JSON are appended, geocoded (Nominatim,
 *   one request per second, honoring their fair-use policy) to get map
 *   coordinates.
 * - Entries that are not countries (e.g. the "Legal" entity) fail geocoding
 *   and are skipped with a warning. Countries whose English name already is
 *   the local name (Kenya, Australia, ...) and countries with multiple
 *   official languages (Belgium, Switzerland, ...) are added without
 *   country_local.
 * - Countries removed from the JSON (e.g. "United States", see PR #1056) are
 *   not re-added; pass --allow "United States" to opt back in explicitly.
 *
 * Usage:
 *   pnpm sync:national-chapters
 *   pnpm sync:national-chapters -- --check      (exit 1 if the file would change; for CI)
 *   pnpm sync:national-chapters -- --dry-run    (print the would-be output, write nothing)
 *   pnpm sync:national-chapters -- --allow "United States"   (re-add an excluded country)
 *   pnpm sync:national-chapters -- --summary <path>          (write a PR body listing
 *     what changed — per chapter, old → new links and calendar URLs — to <path>;
 *     used by the sync workflow so reviewers don't have to eyeball raw
 *     lumaCalendarId values in the diff or construct calendar URLs by hand)
 */
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import minimist from 'minimist'
import type { NationalGroup } from '../src/lib/types.js'
import nationalChaptersJson from '../src/lib/data/national-chapters.json'

const TARGET_FILE = fileURLToPath(
	new URL('../src/lib/data/national-chapters.json', import.meta.url)
)

/**
 * Airtable country name → chapter name to keep in national-chapters.json.
 * Local groups in pauseai-communities.json match their national chapter via
 * `parent_name.includes(chapter.name)`, so a rename here would silently
 * orphan them; pin those names instead.
 */
const NAME_OVERRIDES: Record<string, string> = {
	'Czech Republic': 'Czechia'
}

/**
 * Countries deliberately excluded from the map. "United States" was removed in
 * PR #1056 (the chapter paused its activities); pass --allow "United States"
 * to the sync script re-add it.
 */
const EXCLUDED_COUNTRIES = ['United States']

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
// Nominatim's usage policy requires a descriptive User-Agent and at most one
// request per second.
const NOMINATIM_USER_AGENT =
	'PauseAI-website-national-chapters-sync (github.com/PauseAI/pauseai-website)'
const NOMINATIM_MIN_INTERVAL_MS = 1000

// Inferred from the JSON so the type can't drift from the data it describes.
// lumaCalendarId is omitted from the inferred union before being re-added as
// optional: chapters only carry it when the Airtable group has a Luma page,
// and intersecting the union directly would freeze it to `undefined` on the
// members that lack the key.
type InferredChapter = (typeof nationalChaptersJson.communities)[number]
type Chapter = Omit<InferredChapter, 'lumaCalendarId'> & {
	lumaCalendarId?: string
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Resolves a country name to coordinates and local name using Nominatim,
 * or null if unknown.
 */
async function geocodeCountry(
	country: string
): Promise<{ coords: [number, number]; localName?: string } | null> {
	const url = `${NOMINATIM_URL}?country=${encodeURIComponent(country)}&format=json&limit=1`
	await sleep(NOMINATIM_MIN_INTERVAL_MS)
	const response = await fetch(url, {
		// Nominatim's usage policy requires a descriptive User-Agent identifying
		// the app; add From as recommended for API consumers. No accept-language:
		// without one, Nominatim serves the plain OSM `name` tag, which follows
		// the local convention (Deutschland, Česko, ...).
		headers: { 'User-Agent': NOMINATIM_USER_AGENT, From: 'info@pauseai.info' }
	})
	if (!response.ok) {
		console.warn(`  ⚠ Geocoding ${country} failed: HTTP ${response.status}`)
		return null
	}
	const results = (await response.json()) as {
		lat: string
		lon: string
		name?: string
		addresstype?: string
	}[]
	const match = results.find((r) => r.addresstype === 'country') ?? results[0]
	if (!match) return null
	// Multi-language countries carry all names joined with "/" in the default
	// name tag; without an authoritative pick, omit country_local rather than
	// guessing one. English-identical names (Kenya, Australia, ...) carry no
	// information and are omitted too.
	const name = match.name?.trim() || undefined
	const localName =
		!name || name.includes('/') || name.toLowerCase() === country.trim().toLowerCase()
			? undefined
			: name
	return { coords: [Number(match.lat), Number(match.lon)], localName }
}

/**
 * Chooses the primary link for a national group, mirroring the preference the
 * national-groups page uses (website first, then chat platforms, then email).
 */
function primaryLink(group: NationalGroup): string {
	const candidates = [
		group.website,
		group.whatsappLink,
		group.discordLink,
		group.lumaLink,
		group.linktreeLink,
		group.instagramLink,
		group.tiktokLink,
		group.facebookLink,
		group.youtubeLink,
		group.linkedinLink,
		group.substackLink,
		group.xLink
	]
	for (const link of candidates) {
		const trimmed = link?.trim()
		if (trimmed) return trimmed
	}
	return group.email ? `mailto:${group.email}` : ``
}

/**
 * The Luma page URL stored on the group in Airtable, normalized, but only if
 * it points at a Luma page (lu.ma / luma.com). Anything else — event-specific
 * URLs, typos, other platforms pasted into the wrong column — is dropped
 * rather than resolved. The scheme is optional in Airtable (e.g.
 * "luma.com/pauseai-ch" was observed) and added if missing.
 */
function lumaCalendarLink(group: NationalGroup): string | undefined {
	const link = group.lumaLink?.trim()
	if (!link) return undefined
	// Scheme is optional in Airtable ("luma.com/pauseai-ch" was observed);
	// default to https so the URL check below can match.
	const normalized = /^https?:\/\//.test(link)
		? link.replace(/^http:\/\//, 'https://')
		: `https://${link}`
	return /^https:\/\/(lu\.ma|luma\.com)\//.test(normalized) ? normalized : undefined
}

const LUMA_PAGE_DELAY_MS = 250
// Per-run cache so the same Luma page is never fetched twice.
const calendarIdCache = new Map<string, string | null>()

/**
 * Resolves a Luma page URL (https://luma.com/pauseaimtl) to the calendar API
 * ID (cal-…) that /api/calendar needs for Luma's get-items endpoint. Luma has
 * no documented way to look the ID up from the vanity URL, but it is embedded
 * in the page's HTML as `"api_id":"cal-…"` / `"calendar_api_id":"cal-…"`.
 * Anchoring on those JSON keys avoids false positives like the CSS class
 * `cal-padding`. On failure, falls back to the ID already stored in the JSON
 * (if any) instead of failing the whole sync.
 */
async function resolveCalendarId(lumaLink: string, chapter: Chapter): Promise<string | undefined> {
	const existing = chapter.lumaCalendarId
	if (calendarIdCache.has(lumaLink)) return calendarIdCache.get(lumaLink) ?? existing
	await sleep(LUMA_PAGE_DELAY_MS)
	try {
		const response = await fetch(lumaLink, {
			headers: { 'User-Agent': NOMINATIM_USER_AGENT }
		})
		if (!response.ok) throw new Error(`HTTP ${response.status}`)
		const html = await response.text()
		const id =
			html.match(/"api_id":"(cal-[A-Za-z0-9]+)"/)?.[1] ??
			html.match(/"calendar_api_id":"(cal-[A-Za-z0-9]+)"/)?.[1]
		if (!id) throw new Error('no calendar ID found in page HTML')
		calendarIdCache.set(lumaLink, id)
		return id
	} catch (error) {
		console.warn(
			`  ⚠ Could not resolve ${lumaLink} to a calendar ID: ${error instanceof Error ? error.message : String(error)}`
		)
		calendarIdCache.set(lumaLink, null)
		return existing
	}
}

async function fetchNationalGroups(): Promise<NationalGroup[]> {
	const response = await fetch('https://pauseai.info/api/national-groups')
	if (!response.ok) {
		throw new Error(
			`pauseai.info/api/national-groups request failed: ${response.status} ${response.statusText}`
		)
	}
	return (await response.json()) as NationalGroup[]
}

const argv = minimist<{
	allow: string | string[]
	check?: boolean
	'dry-run'?: boolean
	summary?: string
}>(process.argv.slice(2), {
	string: ['allow', 'summary'],
	boolean: ['check', 'dry-run'],
	default: { allow: [] }
})
const allow = new Set<string>(
	(Array.isArray(argv.allow) ? argv.allow : [argv.allow]).map((c) => c.toLowerCase())
)

const current = fs.readFileSync(TARGET_FILE, 'utf8')
// Cast needed: the JSON import's inferred type predates the optional
// lumaLink/lumaCalendarId keys the sync script may add.
const existing = nationalChaptersJson.communities as Chapter[]
const groups = await fetchNationalGroups()
const groupName = (group: NationalGroup): string =>
	NAME_OVERRIDES[group.name.trim()] ?? group.name.trim()

const chapters: Chapter[] = []
const skipped: string[] = []

// What this run changed, for the PR body summary (--summary).
type ChapterChange =
	| {
			kind: 'updated'
			name: string
			oldLink: string
			newLink: string
			oldLumaId?: string
			newLumaId?: string
	  }
	| { kind: 'added'; name: string; link: string; lumaId?: string }
	| { kind: 'removed'; name: string; oldLink: string; oldLumaId?: string }
const changes: ChapterChange[] = []

// Existing chapters keep their position in the file; only update their link
// or lumaCalendarId when it changed, or drop them when the API no longer
// lists them.
for (const chapter of existing) {
	const group = groups.find((g) => groupName(g) === chapter.name)
	if (!group) {
		console.log(`  – Removing ${chapter.name}: no longer listed as an active national group`)
		changes.push({
			kind: 'removed',
			name: chapter.name,
			oldLink: chapter.link,
			oldLumaId: chapter.lumaCalendarId
		})
		continue
	}
	const link = primaryLink(group)
	const lumaLink = lumaCalendarLink(group)
	const lumaCalendarId = lumaLink ? await resolveCalendarId(lumaLink, chapter) : undefined
	const lumaChanged = lumaCalendarId !== chapter.lumaCalendarId
	if (link !== chapter.link || lumaChanged) {
		console.log(
			`  – Updating ${chapter.name}: link ${chapter.link} → ${link}` +
				(lumaChanged
					? `, calendar ID ${chapter.lumaCalendarId ?? '—'} → ${lumaCalendarId ?? '—'}`
					: '')
		)
		const nextChapter: Chapter = { ...chapter, link }
		if (lumaCalendarId) nextChapter.lumaCalendarId = lumaCalendarId
		else delete nextChapter.lumaCalendarId // group lost its Luma page or ID
		chapters.push(nextChapter)
		changes.push({
			kind: 'updated',
			name: chapter.name,
			oldLink: chapter.link,
			newLink: link,
			oldLumaId: chapter.lumaCalendarId,
			newLumaId: lumaCalendarId
		})
	} else {
		chapters.push(chapter)
	}
}

// New countries are appended at the end, geocoded to get map coordinates.
for (const group of groups) {
	const name = groupName(group)
	if (existing.some((c) => c.name === name)) continue

	if (EXCLUDED_COUNTRIES.some((c) => c.toLowerCase() === name.toLowerCase())) {
		if (allow.has(name.toLowerCase())) {
			// fall through to the new-country path below
		} else {
			console.log(`  – Skipping excluded country: ${name} (pass --allow "${name}" to add it)`)
			continue
		}
	}

	const link = primaryLink(group)
	const lumaLink = lumaCalendarLink(group)
	const lumaCalendarId = lumaLink
		? await resolveCalendarId(lumaLink, { name } as Chapter)
		: undefined
	const geocoded = await geocodeCountry(group.name.trim())
	if (!geocoded) {
		skipped.push(name)
		console.warn(`  ⚠ Could not geocode "${name}" — is it a real country? Skipping.`)
		continue
	}

	const local = geocoded.localName ? { country_local: geocoded.localName } : {}
	if (!geocoded.localName) {
		console.log(`  – "${name}" has no distinct local name; adding without country_local`)
	}
	console.log(
		`  + Adding new country: ${name}${geocoded.localName ? ` (${geocoded.localName})` : ''}`
	)
	chapters.push({
		name,
		lat: geocoded.coords[0],
		lon: geocoded.coords[1],
		link,
		...(lumaCalendarId ? { lumaCalendarId } : {}),
		...local
	})
	changes.push({ kind: 'added', name, link, lumaId: lumaCalendarId })
}

if (skipped.length > 0) {
	console.warn(`  ⚠ Skipped ${skipped.length} non-country entries: ${skipped.join(', ')}`)
}
console.log(`  ${existing.length} existing chapters, ${chapters.length} chapters in output`)

const next = JSON.stringify({ communities: chapters }, null, '\t') + '\n'

/**
 * Builds the sync PR body: the workflow's intro text plus a table of what this
 * run changed. Luma calendar IDs are rendered as their public calendar URL
 * (https://lu.ma/calendar/<id>, which redirects to the calendar's vanity page)
 * so reviewers can check them without constructing a URL by hand.
 */
function buildPrBody(changes: ChapterChange[]): string {
	const lumaUrl = (id?: string): string => (id ? `https://lu.ma/calendar/${id}` : '—')
	const cell = (oldValue: string, newValue: string): string =>
		oldValue === newValue ? oldValue : `${oldValue} → ${newValue}`

	const lines = [
		'This PR was automatically created by the **Sync national chapters** workflow.',
		'',
		'The committed `national-chapters.json` was out of sync with the',
		'national groups served by pauseai.info. It has been regenerated',
		'with `pnpm sync:national-chapters` — review the changes before',
		'merging. The table below only covers links and Luma calendars:',
		'for newly added chapters, the geocoded coordinates and local',
		'name are not shown and should be checked in the diff.',
		'',
		'## Changes in this run',
		'',
		"Luma calendar links are constructed from the synced `lumaCalendarId` (`https://lu.ma/calendar/<id>` redirects to the calendar's public page).",
		'',
		'| Chapter | Link | Luma calendar |',
		'| ------- | ---- | ------------- |'
	]
	if (changes.length === 0) {
		lines.push('_No chapter changes in this run._')
	}
	for (const change of changes) {
		if (change.kind === 'updated') {
			lines.push(
				`| ${change.name} | ${cell(change.oldLink, change.newLink)} | ${cell(lumaUrl(change.oldLumaId), lumaUrl(change.newLumaId))} |`
			)
		} else if (change.kind === 'added') {
			lines.push(`| ${change.name} | added: ${change.link} | ${lumaUrl(change.lumaId)} |`)
		} else {
			lines.push(
				`| ${change.name} | removed (was ${change.oldLink}) | ${lumaUrl(change.oldLumaId)} |`
			)
		}
	}
	return lines.join('\n') + '\n'
}

// The repo has no .gitattributes for JSON, so on Windows checkouts git may
// materialize the file with CRLF. Normalize before comparing (writing still
// uses the LF output, which git normalizes on commit).
const normalize = (text: string): string => text.replace(/\r\n/g, '\n')
if (normalize(next) === normalize(current)) {
	console.log('✓ national-chapters.json is in sync with pauseai.info')
} else if (argv['dry-run']) {
	console.log(next)
} else if (argv.check) {
	console.error(
		'✗ national-chapters.json is out of sync with pauseai.info. Run `pnpm sync:national-chapters` locally and commit the result.'
	)
	process.exit(1)
} else {
	fs.writeFileSync(TARGET_FILE, next)
	console.log('✓ Updated national-chapters.json')
}

// Write the PR body for the sync workflow even when the JSON is already in
// sync: create-pull-request simply won't touch the PR when there is no diff.
if (argv.summary && !argv['dry-run'] && !argv.check) {
	fs.writeFileSync(argv.summary, buildPrBody(changes))
	console.log(`✓ Wrote PR body summary to ${argv.summary}`)
}
