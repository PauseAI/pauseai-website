import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import {
	getNotionClient,
	getString as getSharedString,
	type NotionPropertyValue
} from '$lib/server/notion'
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

function getString(prop: NotionPropertyValue | undefined): string {
	if (!prop) return ''
	if (prop.type === 'number' && prop.number != null) return String(prop.number)
	return getSharedString(prop)
}

function getBoolean(prop: NotionPropertyValue | undefined): boolean {
	if (!prop) return false
	if (prop.type === 'checkbox') return prop.checkbox
	return false
}

function getNumber(prop: NotionPropertyValue | undefined): number | null {
	if (!prop) return null
	if (prop.type === 'number') return prop.number
	return null
}

function amountFromProps(props: PageObjectResponse['properties']): number | null {
	return getNumber(props['Amount'])
}

function sourceFromProps(props: PageObjectResponse['properties']): string {
	return getString(props['Source'])
}

/** Top public donors from Notion, sorted by amount (desc). */
export async function fetchTopPublicDonors(limit: number): Promise<PublicDonor[]> {
	const rawId = (
		(env as Record<string, string | undefined>).NOTION_FUNDING_DONORS_DATABASE_ID?.trim() ||
		FUNDING_DONORS_DATABASE_ID
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
					property: 'Listed',
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

		let source = sourceFromProps(props).trim()
		const isAnonymous = getBoolean(props['Anonymous'])
		if (isAnonymous) {
			source = 'anonymous individual'
		}

		if (!source) {
			console.debug(`Skipping donor ${page.id}: source is empty`)
			continue
		}

		mapped.push({
			id: page.id,
			amountEur,
			source,
			url: isAnonymous ? '' : getString(props['URL']).trim(),
			notes: isAnonymous ? '' : getString(props['Notes'])
		})
	}

	console.log(`Fetched ${mapped.length} public donors from Notion`)
	mapped.sort((a, b) => b.amountEur - a.amountEur)
	return mapped.slice(0, limit)
}
