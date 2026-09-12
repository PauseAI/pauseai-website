import type { AirtableNationalGroup } from '$lib/types.js'
import { fetchAllPages, type AirtableRecord } from '$lib/airtable.js'
import type { ChapterBlockData, ChapterLink } from './types.js'

// Same base/table/filter as src/routes/api/national-groups/+server.ts.
const AIRTABLE_URL = 'https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblEQJ26hxBAEkaP8'

// PauseAI US is a separate organisation that onboards its own members, so its signups are
// treated like a country without a chapter.
const NOT_ONBOARDED_BY_GLOBAL = new Set(['united states'])

// Field -> display label, in the fixed order links should render.
const LINK_FIELDS: { field: keyof AirtableNationalGroup; label: string }[] = [
	{ field: 'website', label: 'Website' },
	{ field: 'discord', label: 'Discord' },
	{ field: 'whatsapp', label: 'WhatsApp' },
	{ field: 'luma', label: 'Events' },
	{ field: 'substack', label: 'Substack' },
	{ field: 'x', label: 'X' },
	{ field: 'instagram', label: 'Instagram' },
	{ field: 'tiktok', label: 'TikTok' },
	{ field: 'facebook', label: 'Facebook' },
	{ field: 'youtube', label: 'YouTube' },
	{ field: 'linkedin', label: 'LinkedIn' },
	{ field: 'linktree', label: 'Linktree' }
]

// Without the field list Airtable returns every column of every row, including an
// attachment column whose signed URLs are a kilobyte a record, on every send.
const QUERY = {
	filterByFormula: 'NOT({inactive})',
	fields: ['country', ...LINK_FIELDS.map(({ field }) => field as string)]
}

function normalizeCountry(country: string): string {
	return country.trim().toLowerCase()
}

/**
 * These are free-text fields a dozen people edit, so a value is taken only when it is a web
 * link, and a missing scheme is assumed rather than dropped: "chat.whatsapp.com/x" is a
 * chapter's real link typed without the https, and silently losing it is worse than adding it.
 * Anything else, including a javascript: or mailto: value, is dropped rather than put in an href.
 */
function webLink(value: unknown): string {
	const trimmed = typeof value === 'string' ? value.trim() : ''
	const url = /^https?:\/\//i.test(trimmed)
		? trimmed
		: /^[\w-]+(\.[\w-]+)+(\/|$)/.test(trimmed)
			? `https://${trimmed}`
			: ''
	// A bracket would end the markdown link early, leaving a dead href and the rest of the URL
	// as visible text, so encode both rather than dropping an otherwise valid link.
	return url.replaceAll('(', '%28').replaceAll(')', '%29')
}

function recordToChapterBlock(record: AirtableRecord<AirtableNationalGroup>): ChapterBlockData {
	const links: ChapterLink[] = LINK_FIELDS.map(({ field, label }) => ({
		label,
		url: webLink(record.fields[field])
	})).filter((link) => link.url.length > 0)

	return { name: (record.fields.country ?? '').trim(), links }
}

/**
 * Looks up the live National Groups record matching `country` (exact, case-insensitive
 * match against the record's own free-text `country` field, the same key
 * src/routes/api/national-groups/+server.ts exposes as `NationalGroup.name`). Null when
 * there is no chapter to point the reader at.
 */
export async function getChapterForOnboardingEmail(
	country: string | undefined
): Promise<ChapterBlockData | null> {
	const cleanCountry = normalizeCountry(country ?? '')
	if (!cleanCountry || NOT_ONBOARDED_BY_GLOBAL.has(cleanCountry)) return null

	// Uncached and on every send, so a rate limit or an Airtable blip must not fail the render:
	// the caller would then send the fallback template, a different email, rather than this one
	// without its chapter block.
	let records: readonly AirtableRecord<AirtableNationalGroup>[]
	try {
		records = await fetchAllPages<AirtableNationalGroup>(fetch, AIRTABLE_URL, [], QUERY)
	} catch (error) {
		console.error('National Groups lookup failed, rendering without a chapter:', error)
		return null
	}

	const match = records.find(
		(record) => normalizeCountry(record.fields.country ?? '') === cleanCountry
	)
	return match ? recordToChapterBlock(match) : null
}

/**
 * The `country` values that currently resolve to a chapter block (active National Groups
 * records), sorted. Exposed for the onboarding-email preview tool's country picker; the
 * render path itself matches free-text, not this list.
 */
export async function listActiveChapterCountries(): Promise<string[]> {
	let records: readonly AirtableRecord<AirtableNationalGroup>[]
	try {
		records = await fetchAllPages<AirtableNationalGroup>(fetch, AIRTABLE_URL, [], QUERY)
	} catch (error) {
		console.error('National Groups lookup failed, listing no countries:', error)
		return []
	}

	return records
		.map((record) => (record.fields.country ?? '').trim())
		.filter(
			(country) => country.length > 0 && !NOT_ONBOARDED_BY_GLOBAL.has(normalizeCountry(country))
		)
		.sort((a, b) => a.localeCompare(b))
}
