import type {
	GetDatabaseResponse,
	PageObjectResponse
} from '@notionhq/client/build/src/api-endpoints'
import { getNotionClient, getString, getImageFromProps } from '$lib/server/notion'

export interface PressCoverage {
	id: string
	title: string
	url: string
	date: string
	type: string
	outlet: string
	notes: string
	/** API proxy URL or fallback */
	image?: string
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
		const targetUrl = getString(props['URL'])
		const hasNotionImage = !!getImageFromProps(props['Image'])

		// Provide the proxy URL if there's a Notion image or a target URL (likely has OG image)
		const imageUrl = hasNotionImage || targetUrl ? `/api/notion-image/${page.id}` : undefined

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

	return { coverage, typeOrder, outletOrder: typeOrder }
}
