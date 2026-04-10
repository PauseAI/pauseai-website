import { fetchPressCoverage } from './notion.server'
import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'

export const load: PageServerLoad = async () => {
	try {
		console.log('NOTION_API_KEY present:', !!env.NOTION_API_KEY)
		const { coverage, typeOrder, outletOrder } = await fetchPressCoverage()
		console.log(`Fetched ${coverage.length} press coverage items.`)
		return { coverage, typeOrder, outletOrder }
	} catch (e) {
		console.error('Failed to fetch press coverage:', e)
		return { coverage: [], typeOrder: [], outletOrder: [] }
	}
}
