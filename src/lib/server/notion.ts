import { Client } from '@notionhq/client'
import { env } from '$env/dynamic/private'

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
