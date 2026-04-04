import { fetchTopPublicDonors } from './notion.server'
import type { PageServerLoad } from './$types'

const TOP_DONOR_COUNT = 15

export const load: PageServerLoad = async () => {
	try {
		const donors = await fetchTopPublicDonors(TOP_DONOR_COUNT)
		return { donors }
	} catch (e) {
		console.error('Failed to fetch funding donors:', e)
		return { donors: [] }
	}
}
