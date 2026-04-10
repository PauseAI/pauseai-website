import { Client } from '@notionhq/client'
import { env } from '$env/dynamic/private'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

let notion: Client | null = null

export function getNotionClient() {
	if (!notion) {
		const auth = env.NOTION_API_KEY?.trim().replace(/^["']|["']$/g, '')
		notion = new Client({
			auth: auth
		})
	}
	return notion
}

type NotionProperties = PageObjectResponse['properties']
type NotionPropertyValue = NotionProperties[string]

/**
 * Extracts a string value from various Notion property types
 */
export function getString(prop: NotionPropertyValue | undefined): string {
	if (!prop) return ''
	if (prop.type === 'title') return prop.title[0]?.plain_text ?? ''
	if (prop.type === 'rich_text') return prop.rich_text[0]?.plain_text ?? ''
	if (prop.type === 'select') return prop.select?.name ?? ''
	if (prop.type === 'url') return prop.url ?? ''
	if (prop.type === 'date') return prop.date?.start ?? ''
	return ''
}

/**
 * Extracts an image URL from a Notion 'files' or 'url' property
 */
export function getImageFromProps(prop: NotionPropertyValue | undefined): string {
	if (!prop) return ''
	if (prop.type === 'url') return prop.url ?? ''
	if (prop.type === 'files' && prop.files?.length) {
		const first = prop.files[0]
		if (first && 'file' in first && first.file?.url) return first.file.url
		if (first && 'external' in first && first.external?.url) return first.external.url
	}
	return ''
}

/**
 * Finds the first property of type 'title' and returns its string value
 */
export function getTitleFromProps(props: NotionProperties): string {
	const titleProp = Object.values(props).find((p) => p.type === 'title')
	return getString(titleProp)
}

/**
 * Gets a date string from a named property, or falls back to the first 'date' property found
 */
export function getDateFromProps(propName: string, props: NotionProperties): string {
	const namedProp = props[propName]
	if (namedProp) return getString(namedProp)
	const dateProp = Object.values(props).find((p) => p.type === 'date')
	return getString(dateProp)
}
