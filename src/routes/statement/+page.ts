import type { Signatory } from '$lib/types'
import { generateCacheControlRecord } from '$lib/utils'

export const prerender = true // workaround for 500 responses

export const load = async ({ fetch, setHeaders }) => {
	const response = await fetch('api/signatories')
	const { signatories, totalCount }: { signatories: Signatory[]; totalCount: number } =
		await response.json()

	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))

	return {
		signatories: signatories,
		totalCount: totalCount
	}
}
