import { Client } from '@notionhq/client'
import * as env from '$env/static/private'

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
