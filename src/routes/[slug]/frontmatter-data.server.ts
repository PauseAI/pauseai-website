import type { FrontmatterDataSources } from '$lib/types'
import { importMarkdown } from './markdown'

export type FrontmatterData = Record<string, unknown>

type ServerFetch = typeof fetch

export async function dataForPost(
	locale: string,
	slug: string,
	fetch: ServerFetch
): Promise<FrontmatterData> {
	const { metadata } = await importMarkdown(locale, slug)
	return fetchFrontmatterData(metadata.data, fetch)
}

async function fetchFrontmatterData(
	sources: FrontmatterDataSources | undefined,
	fetch: ServerFetch
): Promise<FrontmatterData> {
	if (!sources) return {}

	const entries: [string, unknown][] = await Promise.all(
		Object.entries(sources).map(async ([key, url]) => [
			key,
			await fetchFrontmatterUrl(key, url, fetch)
		])
	)
	return Object.fromEntries(entries)
}

async function fetchFrontmatterUrl(key: string, url: string, fetch: ServerFetch): Promise<unknown> {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Frontmatter data source "${key}" failed: ${response.status} ${url}`)
	}

	const contentType = response.headers.get('content-type') ?? ''
	if (contentType.includes('application/json')) {
		return response.json()
	}

	return response.text()
}
