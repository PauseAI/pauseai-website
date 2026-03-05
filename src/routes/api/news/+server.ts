import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { NewsItem, Post } from '$lib/types'

async function getInternalNews(localFetch: typeof fetch): Promise<NewsItem[]> {
	const posts: Post[] = await localFetch('/api/posts').then((res) => res.json())
	const items: NewsItem[] = []

	for (const post of posts) {
		if (post.news && post.date) {
			items.push({
				title: post.title,
				subtitle: post.description || '',
				date: post.date,
				image: post.image,
				href: `/${post.slug}`,
				source: 'internal'
			})
		}
	}

	return items
}

async function getSubstackNews(): Promise<NewsItem[]> {
	try {
		const response = await fetch('https://pauseai.substack.com/feed')
		const xml = await response.text()
		const items: NewsItem[] = []

		// Parse RSS items using regex (lightweight, no XML parser dependency)
		const itemRegex = /<item>([\s\S]*?)<\/item>/g
		let match

		while ((match = itemRegex.exec(xml)) !== null) {
			const itemXml = match[1]

			const title = extractCdata(itemXml, 'title') || extractTag(itemXml, 'title') || ''
			const description =
				extractCdata(itemXml, 'description') || extractTag(itemXml, 'description') || ''
			const link = extractTag(itemXml, 'link') || ''
			const pubDate = extractTag(itemXml, 'pubDate') || ''
			const enclosureMatch = itemXml.match(/<enclosure\s+url="([^"]*)"/)
			const image = enclosureMatch ? enclosureMatch[1] : undefined

			if (title && link) {
				items.push({
					title: decodeHtmlEntities(title),
					subtitle: decodeHtmlEntities(description),
					date: pubDate ? new Date(pubDate).toISOString() : '',
					image,
					href: link,
					source: 'substack'
				})
			}
		}

		return items
	} catch (error) {
		console.error('Failed to fetch Substack RSS feed:', error)
		return []
	}
}

function decodeHtmlEntities(text: string): string {
	return text
		.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
		.replace(/&#x([a-f\d]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&apos;/g, "'")
}

function extractTag(xml: string, tag: string): string | null {
	const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))
	return match ? match[1] : null
}

function extractCdata(xml: string, tag: string): string | null {
	const match = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([^\\]]*?)\\]\\]></${tag}>`))
	return match ? match[1] : null
}

export const GET: RequestHandler = async ({ fetch, url }) => {
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
	const pageSize = Math.max(1, Math.min(12, parseInt(url.searchParams.get('pageSize') || '6', 10)))

	const [internal, substack] = await Promise.all([getInternalNews(fetch), getSubstackNews()])

	const allNews = [...internal, ...substack].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	)

	const total = allNews.length
	const totalPages = Math.ceil(total / pageSize)
	const start = (page - 1) * pageSize
	const items = allNews.slice(start, start + pageSize)

	return json({ items, total, page, pageSize, totalPages })
}
