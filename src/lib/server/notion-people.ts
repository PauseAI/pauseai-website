import { getNotionClient } from './notion.js'
import type { Person } from '$lib/types'
import { defaultTitle } from '$lib/config'

export async function fetchNotionPeople(): Promise<Person[]> {
	const notion = getNotionClient()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const results: any[] = []
	let cursor: string | undefined = undefined

	const dbId = '8948430b6a9940d5976581b71d9b3cd1'

	try {
		while (true) {
			const response = await notion.databases.query({
				database_id: dbId!,
				start_cursor: cursor
			})

			// Append correctly based on the new SDK return type
			if (response.results && Array.isArray(response.results)) {
				results.push(...response.results)
			}

			if (!response.has_more) break
			cursor = response.next_cursor || undefined
		}

		return results.map(notionPageToPerson)
	} catch (error) {
		console.error('Error fetching from Notion:', error)
		throw error
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function notionPageToPerson(page: any): Person {
	const props = page.properties

	const getText = (propName: string) => {
		const prop = props[propName]
		if (!prop) return ''
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (prop.type === 'title') return prop.title.map((t: any) => t.plain_text).join('')
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (prop.type === 'rich_text') return prop.rich_text.map((t: any) => t.plain_text).join('')
		if (prop.type === 'select') return prop.select?.name || ''
		return ''
	}

	const getCheckbox = (propName: string) => {
		return props[propName]?.checkbox || false
	}

	const getNumber = (propName: string) => {
		return props[propName]?.number ?? undefined
	}

	const getImage = (propName: string) => {
		const files = props[propName]?.files
		if (!files || files.length === 0) return undefined
		const file = files[0]
		return file.type === 'external' ? file.external.url : file.file.url
	}

	return {
		id: page.id,
		name: getText('Full name'),
		bio: '',
		title: getText('Title') || defaultTitle,
		image: getImage('Photo') || getImage('Image'),
		privacy: getCheckbox('Privacy'),
		checked: getCheckbox('About') || getCheckbox('ABout'),
		duplicate: getCheckbox('duplicate'),
		order: getNumber('About order') ?? 999
	}
}
