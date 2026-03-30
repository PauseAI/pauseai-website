import { getNotionClient } from '$lib/server/notion'

export interface PressCoverage {
	id: string
	title: string
	url: string
	date: string
	outlet: string
	notes: string
}

export async function fetchPressCoverage(): Promise<{
	coverage: PressCoverage[]
	outletOrder: string[]
}> {
	const notion = getNotionClient()
	const databaseId = '212fd8030c4d42ff9de5710f92efecff'

	let outletOrder: string[] = []
	try {
		const dbInfo = (await notion.databases.retrieve({ database_id: databaseId })) as any
		const outletProp = dbInfo.properties['Outlet']
		if (outletProp && outletProp.select && outletProp.select.options) {
			outletOrder = outletProp.select.options.map((opt: any) => opt.name)
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
					property: 'Date', // Assuming 'Date', fallback handling below
					direction: 'descending'
				}
			]
		})
		.catch((e: any) => {
			console.error('Notion API Error:', e.body || e.message || e)
			return { results: [] }
		})

	const coverage = (response.results as any[]).map((page) => {
		const props = page.properties

		// Helper to extract text from various Notion property types
		const getText = (propName: string): string => {
			const prop = props[propName]
			if (!prop) return ''
			if (prop.type === 'title') return prop.title[0]?.plain_text || ''
			if (prop.type === 'rich_text') return prop.rich_text[0]?.plain_text || ''
			if (prop.type === 'select') return prop.select?.name || ''
			return ''
		}

		const getTitleText = (): string => {
			const prop = Object.values(props).find((p: any) => p.type === 'title') as any
			if (!prop) return ''
			return prop.title[0]?.plain_text || ''
		}

		const getUrl = (propName: string): string => {
			const prop = props[propName] || props['Link']
			if (!prop) return ''
			if (prop.type === 'url') return prop.url || ''
			return ''
		}

		const getDate = (propName: string): string => {
			const prop = props[propName] || Object.values(props).find((p: any) => p.type === 'date')
			if (!prop) return ''
			if (prop.type === 'date') return prop.date?.start || ''
			return ''
		}

		return {
			id: page.id,
			title: getText('Name') || getText('Title') || getTitleText(),
			url: getUrl('URL'),
			date: getDate('Date') || getDate('Published'),
			outlet: getText('Outlet'),
			notes: getText('Notes') || getText('Description') || getText('Abstract') || ''
		}
	})

	return { coverage, outletOrder }
}
