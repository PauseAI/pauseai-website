import type {
	GetDatabaseResponse,
	PageObjectResponse
} from '@notionhq/client/build/src/api-endpoints'
import { getNotionClient } from '$lib/server/notion'
import fs from 'node:fs'
import path from 'node:path'

async function downloadImageLocally(id: string, url: string): Promise<string> {
	if (!url) return ''

	try {
		const response = await fetch(url)
		if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
		const buffer = await response.arrayBuffer()

		const type = response.headers.get('content-type') || ''
		let ext = '.jpg'
		if (type.includes('png')) ext = '.png'
		else if (type.includes('webp')) ext = '.webp'
		else if (type.includes('gif')) ext = '.gif'
		else if (url.includes('.avif')) ext = '.avif'

		const filename = `${id}${ext}`

		const staticDir = path.resolve('static', 'press-coverage')
		if (!fs.existsSync(staticDir)) fs.mkdirSync(staticDir, { recursive: true })
		fs.writeFileSync(path.join(staticDir, filename), Buffer.from(buffer))

		const clientDir = path.resolve('.svelte-kit', 'output', 'client', 'press-coverage')
		if (fs.existsSync(path.resolve('.svelte-kit', 'output', 'client'))) {
			if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true })
			fs.writeFileSync(path.join(clientDir, filename), Buffer.from(buffer))
		}

		return `/press-coverage/${filename}`
	} catch (e) {
		console.error('Failed to download image from Notion/OG', e)
		return url // Fallback to original
	}
}

async function fetchOgImage(url: string): Promise<string> {
	if (!url || !url.startsWith('http')) return ''
	try {
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), 4000)
		const response = await fetch(url, { signal: controller.signal })
		clearTimeout(timeoutId)

		if (!response.ok) return ''
		const html = await response.text()

		const ogImageMatch =
			html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)

		if (ogImageMatch && ogImageMatch[1]) {
			let ogUrl = ogImageMatch[1].replace(/&amp;/g, '&')
			if (ogUrl.startsWith('/')) {
				const urlObj = new URL(url)
				ogUrl = `${urlObj.origin}${ogUrl}`
			}
			return ogUrl
		}
		return ''
	} catch (e) {
		return ''
	}
}

export interface PressCoverage {
	id: string
	title: string
	url: string
	date: string
	type: string
	outlet: string
	notes: string
	/** First file URL or image URL from Notion property `Image` */
	image?: string
}

type NotionPropertyValue = PageObjectResponse['properties'][string]

function getString(prop: NotionPropertyValue | undefined): string {
	if (!prop) return ''
	if (prop.type === 'title') return prop.title[0]?.plain_text ?? ''
	if (prop.type === 'rich_text') return prop.rich_text[0]?.plain_text ?? ''
	if (prop.type === 'select') return prop.select?.name ?? ''
	if (prop.type === 'url') return prop.url ?? ''
	if (prop.type === 'date') return prop.date?.start ?? ''
	return ''
}

function getTitleFromProps(props: PageObjectResponse['properties']): string {
	const titleProp = Object.values(props).find((p) => p.type === 'title')
	return getString(titleProp)
}

function getDateFromProps(propName: string, props: PageObjectResponse['properties']): string {
	const namedProp = props[propName]
	if (namedProp) return getString(namedProp)
	const dateProp = Object.values(props).find((p) => p.type === 'date')
	return getString(dateProp)
}

function getImageFromProps(prop: NotionPropertyValue | undefined): string {
	if (!prop) return ''
	if (prop.type === 'url') return prop.url ?? ''
	if (prop.type === 'files' && prop.files?.length) {
		const first = prop.files[0]
		if (first && 'file' in first && first.file?.url) return first.file.url
		if (first && 'external' in first && first.external?.url) return first.external.url
	}
	return ''
}

export async function fetchPressCoverage(): Promise<{
	coverage: PressCoverage[]
	typeOrder: string[]
	outletOrder: string[]
}> {
	const notion = getNotionClient()
	const databaseId = '212fd8030c4d42ff9de5710f92efecff'

	let typeOrder: string[] = []
	try {
		const dbInfo: GetDatabaseResponse = await notion.databases.retrieve({ database_id: databaseId })
		const typeProp = dbInfo.properties['Type']
		if (typeProp?.type === 'select') {
			typeOrder = typeProp.select.options.map((opt) => opt.name)
		}
	} catch (e) {
		console.error('Failed to retrieve database schema for sorting tabs', e)
	}

	const response = await notion.databases
		.query({
			database_id: databaseId,
			filter: {
				property: 'Public',
				checkbox: {
					equals: true
				}
			},
			sorts: [
				{
					property: 'Date',
					direction: 'descending'
				}
			]
		})
		.catch((e: unknown) => {
			const err = e as { body?: string; message?: string }
			console.error('Notion API Error:', err.body ?? err.message ?? e)
			return { results: [] as PageObjectResponse[] }
		})

	const coverage = await Promise.all(
		(response.results as PageObjectResponse[]).map(async (page) => {
			const props = page.properties
			let imageUrl = getImageFromProps(props['Image'])
			const targetUrl = getString(props['URL'])

			if (!imageUrl && targetUrl) {
				imageUrl = await fetchOgImage(targetUrl)
			}

			if (imageUrl) {
				imageUrl = await downloadImageLocally(page.id, imageUrl)
			}

			return {
				id: page.id,
				title: getString(props['Name']) || getString(props['Title']) || getTitleFromProps(props),
				url: targetUrl,
				date: getDateFromProps('Date', props) || getDateFromProps('Published', props),
				type: getString(props['Type']),
				outlet: getString(props['Outlet']),
				notes:
					getString(props['Notes']) ||
					getString(props['Description']) ||
					getString(props['Abstract']) ||
					'',
				...(imageUrl ? { image: imageUrl } : {})
			}
		})
	)

	return { coverage, typeOrder, outletOrder: typeOrder }
}
