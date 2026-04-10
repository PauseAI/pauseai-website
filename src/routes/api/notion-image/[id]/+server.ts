import { error } from '@sveltejs/kit'
import { getNotionClient } from '$lib/server/notion'
import type { RequestHandler } from './$types'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

const PRESS_DATABASE_ID = '212fd8030c4d42ff9de5710f92efecff'

// Helper to extract image from props (reusing logic from notion.server.ts)
function getImageFromProps(prop: any): string {
	if (!prop) return ''
	if (prop.type === 'url') return prop.url ?? ''
	if (prop.type === 'files' && prop.files?.length) {
		const first = prop.files[0]
		if (first && 'file' in first && first.file?.url) return first.file.url
		if (first && 'external' in first && first.external?.url) return first.external.url
	}
	return ''
}

function getString(prop: any): string {
	if (!prop) return ''
	if (prop.type === 'url') return prop.url ?? ''
	if (prop.type === 'rich_text') return prop.rich_text[0]?.plain_text ?? ''
	return ''
}

async function fetchOgImage(url: string): Promise<string> {
	if (!url || !url.startsWith('http')) return ''
	try {
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), 4000)
		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			}
		})
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
	} catch {
		return ''
	}
}

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params
	if (!id) throw error(400, 'Missing ID')

	const notion = getNotionClient()

	try {
		const page = (await notion.pages.retrieve({ page_id: id })) as PageObjectResponse

		// Security Check: Ensure parent is the press database
		// Normalizing IDs by removing dashes for comparison
		const parentDbId =
			page.parent.type === 'database_id' ? page.parent.database_id.replace(/-/g, '') : ''
		if (parentDbId !== PRESS_DATABASE_ID) {
			throw error(403, 'Unauthorized database access')
		}

		let imageUrl = getImageFromProps(page.properties['Image'])
		if (!imageUrl) {
			const targetUrl = getString(page.properties['URL'])
			if (targetUrl) {
				imageUrl = await fetchOgImage(targetUrl)
			}
		}

		if (!imageUrl) throw error(404, 'No image found for this page')

		const response = await fetch(imageUrl)
		if (!response.ok) throw error(502, `Failed to fetch image from ${imageUrl}`)

		const blob = await response.blob()
		const contentType = response.headers.get('content-type') || 'image/jpeg'

		return new Response(blob, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=3600, s-maxage=86400'
			}
		})
	} catch (e: any) {
		console.error('API Error in notion-image:', e)
		if (e.status) throw e
		throw error(500, e.message || 'Internal Server Error')
	}
}
