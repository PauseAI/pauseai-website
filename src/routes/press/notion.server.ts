import type {
	GetDatabaseResponse,
	PageObjectResponse
} from '@notionhq/client/build/src/api-endpoints'
import { getNotionClient } from '$lib/server/notion'

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

	const coverage = (response.results as PageObjectResponse[]).map((page) => {
		const props = page.properties
		const imageUrl = getImageFromProps(props['Image'])
		return {
			id: page.id,
			title: getString(props['Name']) || getString(props['Title']) || getTitleFromProps(props),
			url: getString(props['URL']),
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

	return { coverage, typeOrder, outletOrder: typeOrder }
}
