import { getLocale } from '$lib/paraglide/runtime'
import type { PageServerLoad } from './$types'
import { cssForPost } from './post-css.server'

export const load: PageServerLoad = ({ params: { slug } }) => {
	const locale = getLocale()
	const src = locale === 'en' ? `src/posts/${slug}.md` : `l10n-cage/md/${locale}/${slug}.md`
	return { cssUrls: cssForPost(src) }
}
