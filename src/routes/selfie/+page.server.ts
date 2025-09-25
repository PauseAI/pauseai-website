import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const config = {
	runtime: 'edge'
}

export const load: PageServerLoad = () => {
	// Permanent redirect from /selfie to /sayno
	throw redirect(301, '/sayno')
}
