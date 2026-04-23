import { http, HttpResponse, type JsonBodyType } from 'msw'
import { readFileSync } from 'node:fs'
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

export const handlers = [
	...AIRTABLE_TABLES.map(([table, fixture]) =>
		http.get(`https://api.airtable.com/v0/*/${table}*`, () => HttpResponse.json(fixture))
	),
	http.get('https://api.airtable.com/v0/*', () => HttpResponse.json(EMPTY_AIRTABLE)),

	http.get(`https://api.notion.com/v1/databases/${PRESS_DB}`, () =>
		HttpResponse.json(PRESS_DB_SCHEMA)
	),
	http.post(`https://api.notion.com/v1/databases/${PRESS_DB}/query`, () =>
		HttpResponse.json(PRESS_QUERY)
	),
	http.post(`https://api.notion.com/v1/databases/${FUNDING_DB}/query`, () =>
		HttpResponse.json(FUNDING_QUERY)
	),
	http.post('https://api.notion.com/v1/databases/*/query', () =>
		HttpResponse.json(EMPTY_NOTION_LIST)
	),

	// /api/news/+server.ts parses this XML and merges items with internal
	// posts flagged `news: true` before returning JSON to the client.
	http.get('https://pauseai.substack.com/feed', () => HttpResponse.xml(SUBSTACK_FEED))
]
