import { getNotionClient } from '$lib/server/notion'
import { json } from '@sveltejs/kit'

export async function GET() {
	const notion = getNotionClient()
	const response = await notion.databases.query({
		database_id: '212fd8030c4d42ff9de5710f92efecff',
		page_size: 1
	})
	return json(response.results[0])
}
