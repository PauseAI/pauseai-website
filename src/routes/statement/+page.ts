import type { Signatory } from '$lib/types'

export const prerender = true // workaround for 500 responses

export const load = async ({ fetch, setHeaders }) => {
	const response = await fetch('api/signatories')
	const { signatories, totalCount }: { signatories: Signatory[]; totalCount: number } =
		await response.json()

	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})

	return {
		signatories: signatories,
		totalCount: totalCount
	}
}
