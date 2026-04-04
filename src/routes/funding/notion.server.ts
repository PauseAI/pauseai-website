import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { getNotionClient } from '$lib/server/notion'
import { env } from '$env/dynamic/private'

/** 32-char Notion database id (hyphens optional). Override with NOTION_FUNDING_DONORS_DATABASE_ID in deploy env. */
const FUNDING_DONORS_DATABASE_ID = '185ce958adb5459eb1eedc7b72da5738'

export interface PublicDonor {
	id: string
	amountEur: number
	source: string
	url: string
	/** Extra text inside parentheses, e.g. note or detail */
	notes: string
}

type NotionPropertyValue = PageObjectResponse['properties'][string]

function getString(prop: NotionPropertyValue | undefined): string {
	if (!prop) return ''
	if (prop.type === 'title') return prop.title[0]?.plain_text ?? ''
	if (prop.type === 'rich_text') return prop.rich_text[0]?.plain_text ?? ''
	if (prop.type === 'select') return prop.select?.name ?? ''
	if (prop.type === 'url') return prop.url ?? ''
	if (prop.type === 'date') return prop.date?.start ?? ''
	if (prop.type === 'number' && prop.number != null) return String(prop.number)
	if (prop.type === 'formula') {
		if (prop.formula.type === 'string') return prop.formula.string ?? ''
		if (prop.formula.type === 'number' && prop.formula.number != null)
			return String(prop.formula.number)
	}
	return ''
}

function getNumber(prop: NotionPropertyValue | undefined): number | null {
	if (!prop) return null
	if (prop.type === 'number') return prop.number
	if (prop.type === 'formula' && prop.formula.type === 'number') return prop.formula.number
	return null
}

function getTitleFromProps(props: PageObjectResponse['properties']): string {
	const titleProp = Object.values(props).find((p) => p.type === 'title')
	return getString(titleProp)
}

function amountFromProps(props: PageObjectResponse['properties']): number | null {
	const keys = ['Amount', 'EUR', 'Total', 'Total (EUR)'] as const
	for (const k of keys) {
		const n = getNumber(props[k])
		if (n != null) return n
	}
	return null
}

function sourceFromProps(props: PageObjectResponse['properties']): string {
	return (
		getString(props['Source']) ||
		getString(props['Name']) ||
		getString(props['Donor']) ||
		getString(props['Title']) ||
		getTitleFromProps(props)
	)
}

/** Top public donors from Notion, sorted by amount (desc). */
export async function fetchTopPublicDonors(limit: number): Promise<PublicDonor[]> {
	const rawId = (
		env.NOTION_FUNDING_DONORS_DATABASE_ID?.trim() || FUNDING_DONORS_DATABASE_ID
	).replace(/^["']|["']$/g, '')
	if (!rawId) {
		console.warn(
			'Set NOTION_FUNDING_DONORS_DATABASE_ID or FUNDING_DONORS_DATABASE_ID in notion.server.ts; donors list is empty.'
		)
		return []
	}

	const notion = getNotionClient()
	const databaseId = rawId.replace(/-/g, '')

	const results: PageObjectResponse[] = []
	let cursor: string | undefined

	try {
		do {
			const response = await notion.databases.query({
				database_id: databaseId,
				filter: {
					property: 'Public',
					checkbox: {
						equals: true
					}
				},
				start_cursor: cursor,
				page_size: 100
			})
			results.push(...(response.results as PageObjectResponse[]))
			cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
		} while (cursor)
	} catch (e: unknown) {
		const err = e as { body?: string; message?: string }
		console.error('Notion funding donors API error:', err.body ?? err.message ?? e)
		return []
	}

	const mapped: PublicDonor[] = []
	for (const page of results) {
		const props = page.properties
		const amountEur = amountFromProps(props)
		if (amountEur == null || amountEur <= 0) {
			console.debug(`Skipping donor ${page.id}: amount is ${amountEur}`)
			continue
		}
		const source = sourceFromProps(props).trim()
		if (!source) {
			console.debug(`Skipping donor ${page.id}: source is empty`)
			continue
		}

		mapped.push({
			id: page.id,
			amountEur,
			source,
			url: getString(props['URL']).trim(),
			notes:
				getString(props['Notes']) || getString(props['Detail']) || getString(props['Via']) || ''
		})
	}

	console.log(`Fetched ${mapped.length} public donors from Notion`)
	mapped.sort((a, b) => b.amountEur - a.amountEur)
	return mapped.slice(0, limit)
}
