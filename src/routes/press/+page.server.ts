import { fetchPressCoverage } from './notion.server'
import type { PageServerLoad } from './$types'
import * as env from '$env/static/private'

export const prerender = true
export const load: PageServerLoad = async () => {
	try {
		console.log('NOTION_API_KEY present:', !!env.NOTION_API_KEY)
		const { coverage, outletOrder } = await fetchPressCoverage()
		console.log(`Fetched ${coverage.length} press coverage items.`)
		return { coverage, outletOrder }
	} catch (e) {
		console.error('Failed to fetch press coverage:', e)
		return { coverage: [], outletOrder: [] }
	}
}
