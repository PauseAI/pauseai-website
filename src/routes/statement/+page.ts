import type { SignatoriesApiResponse } from '$api/signatories/+server.js'
import { generateCacheControlRecord } from '$lib/utils'
import type { PageLoad } from './$types'

export const prerender = true // workaround for 500 responses

export const load: PageLoad = async ({ fetch, setHeaders }) => {
	const response = await fetch('api/signatories')
	const { signatories, totalCount } = (await response.json()) as SignatoriesApiResponse

	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))

	return {
		signatories: signatories,
		totalCount: totalCount
	}
}
