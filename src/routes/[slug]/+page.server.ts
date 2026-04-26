import { getLocale } from '$lib/paraglide/runtime'
import type { PageServerLoad } from './$types'
import { cssForPost } from './post-css.server'

export const load: PageServerLoad = ({ params: { slug } }) => {
	return { cssUrls: cssForPost(slug, getLocale()) }
}
