import { getLocale } from '$lib/paraglide/runtime'
import { cssForPost } from './post-css.server'
import { imagesForPost } from './post-images.server'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params: { slug } }) => {
	const locale = getLocale()
	const cssUrls = cssForPost(slug, locale)
	const { pictures, banner, metaImageUrl } = await imagesForPost(locale, slug)

	return { cssUrls, pictures, banner, metaImageUrl }
}
