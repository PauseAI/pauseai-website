import { prerender } from '$app/server'
import { fetchTopPublicDonors, type PublicDonor } from './server/notion-funding'

const TOP_DONOR_COUNT = 15

export const getTopPublicDonors = prerender(
	(): Promise<PublicDonor[]> => fetchTopPublicDonors(TOP_DONOR_COUNT)
)
