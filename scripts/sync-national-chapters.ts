/**
 * Syncs src/routes/communities/national-chapters.json with the national groups
 * served by https://pauseai.info/api/national-groups (backed by the Airtable
 * "National groups" table).
 *
 * Behavior:
 * - Chapters already present in the JSON are preserved verbatim: their
 *   coordinates and country_local labels were hand-picked and the API has
 *   neither, so they are never regenerated.
 * - Chapters whose link changed are updated. Changes are non-invasive: only
 *   outdated values are touched, never the ordering of existing entries.
 * - Countries that are new to the JSON are appended, geocoded (Nominatim,
 *   one request per second, honoring their fair-use policy) to get map
 *   coordinates.
 * - Entries that are not countries (e.g. the "Legal" entity) fail geocoding
 *   and are skipped with a warning.
 * - Countries removed from the JSON (e.g. "United States", see PR #1056) are
 *   not re-added; pass --allow "United States" to opt back in explicitly.
 *
 * Usage:
 *   pnpm sync:national-chapters
 *   pnpm sync:national-chapters -- --check      (exit 1 if the file would change; for CI)
 *   pnpm sync:national-chapters -- --dry-run    (print the would-be output, write nothing)
 *   pnpm sync:national-chapters -- --allow "United States"   (re-add an excluded country)
 */
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import minimist from 'minimist'
import type { NationalGroup } from '../src/lib/types.js'
import nationalChaptersJson from '../src/routes/communities/national-chapters.json'

const TARGET_FILE = fileURLToPath(
	new URL('../src/routes/communities/national-chapters.json', import.meta.url)
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
type Chapter = (typeof nationalChaptersJson.communities)[number]

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** Resolves a country name to [lat, lon] using Nominatim, or null if unknown. */
async function geocodeCountry(country: string): Promise<[number, number] | null> {
	const url = `${NOMINATIM_URL}?country=${encodeURIComponent(country)}&format=json&limit=1`
	await sleep(NOMINATIM_MIN_INTERVAL_MS)
	const response = await fetch(url, {
		// Nominatim's usage policy requires a descriptive User-Agent identifying
		// the app; add From as recommended for API consumers.
		headers: { 'User-Agent': NOMINATIM_USER_AGENT, From: 'tech@pauseai.info' }
	})
	if (!response.ok) {
		console.warn(`  ⚠ Geocoding ${country} failed: HTTP ${response.status}`)
		return null
	}
	const results = (await response.json()) as { lat: string; lon: string; addresstype?: string }[]
	const match = results.find((r) => r.addresstype === 'country') ?? results[0]
	if (!match) return null
	return [Number(match.lat), Number(match.lon)]
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

async function fetchNationalGroups(): Promise<NationalGroup[]> {
	const response = await fetch('https://pauseai.info/api/national-groups')
	if (!response.ok) {
		throw new Error(
			`pauseai.info/api/national-groups request failed: ${response.status} ${response.statusText}`
		)
	}
	return (await response.json()) as NationalGroup[]
}

const argv = minimist<{ allow: string | string[]; check?: boolean; 'dry-run'?: boolean }>(
	process.argv.slice(2),
	{
		string: ['allow'],
		boolean: ['check', 'dry-run'],
		default: { allow: [] }
	}
)
const allow = new Set<string>(
	(Array.isArray(argv.allow) ? argv.allow : [argv.allow]).map((c) => c.toLowerCase())
)

const current = fs.readFileSync(TARGET_FILE, 'utf8')
const { communities: existing } = nationalChaptersJson
const groups = await fetchNationalGroups()
const groupName = (group: NationalGroup): string =>
	NAME_OVERRIDES[group.name.trim()] ?? group.name.trim()

const chapters: Chapter[] = []
const skipped: string[] = []

// Existing chapters keep their position in the file; only update their link
// when it changed, or drop them when the API no longer lists them.
for (const chapter of existing) {
	const group = groups.find((g) => groupName(g) === chapter.name)
	if (!group) {
		console.log(`  – Removing ${chapter.name}: no longer listed as an active national group`)
		continue
	}
	const link = primaryLink(group)
	if (link !== chapter.link) {
		console.log(`  – Updating link for ${chapter.name}: ${chapter.link} → ${link}`)
		chapters.push({ ...chapter, link })
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
	const coords = await geocodeCountry(group.name.trim())
	if (!coords) {
		skipped.push(name)
		console.warn(`  ⚠ Could not geocode "${name}" — is it a real country? Skipping.`)
		continue
	}

	console.log(`  + Adding new country: ${name}`)
	chapters.push({ name, lat: coords[0], lon: coords[1], link })
}

if (skipped.length > 0) {
	console.warn(`  ⚠ Skipped ${skipped.length} non-country entries: ${skipped.join(', ')}`)
}
console.log(`  ${existing.length} existing chapters, ${chapters.length} chapters in output`)

const next = JSON.stringify({ communities: chapters }, null, '\t') + '\n'

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
