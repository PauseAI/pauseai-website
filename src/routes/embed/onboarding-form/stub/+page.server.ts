import { getStubSubmissions } from '$lib/server/onboarding-stub'
import type { PageServerLoad } from './$types'

export const prerender = false

export const load: PageServerLoad = ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' })
	return { submissions: getStubSubmissions() }
}
