// MSW-node bootstrap for visual-diff runs. Loaded via NODE_OPTIONS=--import
// from the visual-diff GitHub Actions step. No-op in normal dev/build.
//
// Intercepts outbound HTTP from `pnpm build` (prerender, remote prerender
// functions) and `pnpm preview` (on-demand SSR) so snapshots render against
// pinned fixtures instead of live APIs, keeping runs deterministic and free
// of production secrets.
//
// When MSW_WARN_LOG is set, requests that fell through without an explicit
// fixture — either a wholly new host (bypassed to the real network per
// `onUnhandledRequest: 'bypass'` below) or a known host that hit a
// per-table/db catch-all — are logged so the scope-comment can surface them.

import { http, HttpResponse, passthrough, type JsonBodyType } from 'msw'
import { setupServer } from 'msw/node'
import { appendFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const fixturesDir = join(here, 'fixtures')

function loadJson(name: string): JsonBodyType {
	return JSON.parse(readFileSync(join(fixturesDir, name), 'utf8')) as JsonBodyType
}

function loadText(name: string): string {
	return readFileSync(join(fixturesDir, name), 'utf8')
}

const warnLog = process.env.MSW_WARN_LOG
function logWarn(kind: string, method: string, url: string): void {
	if (warnLog) appendFileSync(warnLog, `${kind} ${method} ${url}\n`)
}

function catchAll(kind: string, method: 'get' | 'post', pattern: string, body: JsonBodyType) {
	return http[method](pattern, ({ request }) => {
		logWarn(kind, request.method, request.url)
		return HttpResponse.json(body)
	})
}

// Load each fixture once at module init; handlers return the already-parsed
// objects per request instead of re-reading + re-parsing on every hit.
const PEOPLE = loadJson('airtable-people.json')
const SIGNATORIES = loadJson('airtable-signatories.json')
const NATIONAL_GROUPS = loadJson('airtable-national-groups.json')
const PRESS_DB_SCHEMA = loadJson('notion-press-db.json')
const PRESS_QUERY = loadJson('notion-press-query.json')
const FUNDING_QUERY = loadJson('notion-funding.json')
const SUBSTACK_FEED = loadText('substack-feed.xml')

const EMPTY_AIRTABLE = { records: [] }
const EMPTY_NOTION_LIST = {
	object: 'list',
	results: [],
	next_cursor: null,
	has_more: false
}

// All Airtable reads are under base appWPTGqZmUcs3NWu; SDK fetches via
// api.airtable.com/v0/{base}/{table}[?...]. Per-table fixtures first, then
// a catch-all so uncovered tables don't leak to the live API.
const AIRTABLE_TABLES: Array<[table: string, fixture: JsonBodyType]> = [
	['tblL1icZBhTV1gQ9o', PEOPLE],
	['tbl2emfOWNWoVz1kW', SIGNATORIES],
	['tblEQJ26hxBAEkaP8', NATIONAL_GROUPS]
]

const PRESS_DB = '212fd8030c4d42ff9de5710f92efecff'
const FUNDING_DB = '185ce958adb5459eb1eedc7b72da5738'

const handlers = [
	...AIRTABLE_TABLES.map(([table, fixture]) =>
		http.get(`https://api.airtable.com/v0/*/${table}*`, () => HttpResponse.json(fixture))
	),
	catchAll('AIRTABLE_CATCH_ALL', 'get', 'https://api.airtable.com/v0/*', EMPTY_AIRTABLE),

	http.get(`https://api.notion.com/v1/databases/${PRESS_DB}`, () =>
		HttpResponse.json(PRESS_DB_SCHEMA)
	),
	http.post(`https://api.notion.com/v1/databases/${PRESS_DB}/query`, () =>
		HttpResponse.json(PRESS_QUERY)
	),
	http.post(`https://api.notion.com/v1/databases/${FUNDING_DB}/query`, () =>
		HttpResponse.json(FUNDING_QUERY)
	),
	catchAll(
		'NOTION_CATCH_ALL',
		'post',
		'https://api.notion.com/v1/databases/*/query',
		EMPTY_NOTION_LIST
	),

	// /api/news/+server.ts parses this XML and merges items with internal
	// posts flagged `news: true` before returning JSON to the client.
	http.get('https://pauseai.substack.com/feed', () => HttpResponse.xml(SUBSTACK_FEED)),

	// Luma calendar — /api/calendar/+server.ts fetches this on every page load
	// via NearbyEvent in the global layout. NearbyEvent only renders when the
	// user has a geo match; CI geo lookup is disabled, so an empty entries
	// list is enough to keep the layout stable without leaking live requests.
	http.get('https://api.lu.ma/calendar/get-items', () => HttpResponse.json({ entries: [] })),

	// Segment analytics — build-/preview-time batches that shouldn't actually
	// be delivered. 204 No Content is what Segment itself returns on success.
	http.post('https://api.segment.io/v1/*', () => new HttpResponse(null, { status: 204 })),

	// jsDelivr is a legitimate build-time CDN for NPM packages (inlang
	// plugins, etc.). Mocking would break the build, so pass through to the
	// real network while suppressing the un-fixtured warning.
	http.get('https://cdn.jsdelivr.net/*', () => passthrough())
]

if (process.env.VISUAL_TEST === '1') {
	const server = setupServer(...handlers)

	server.events.on('request:unhandled', ({ request }) => {
		// Filter same-origin preview-server calls (the Node process making a
		// fetch back to localhost:4173 for /api/posts etc.). These aren't
		// un-fixtured external integrations.
		if (request.url.startsWith('http://localhost:')) return
		logWarn('UNHANDLED', request.method, request.url)
	})

	server.listen({ onUnhandledRequest: 'bypass' })
}
