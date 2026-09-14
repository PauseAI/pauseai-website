import { getLocale } from '$lib/paraglide/runtime'
import type { PageLoad } from './$types'
import { asError } from '$lib/utils'
import { importMarkdown } from './markdown'

export const load: PageLoad = async ({ params: { slug }, depends, data: serverData }) => {
	depends('paraglide:lang')
	try {
		const locale = getLocale()
		const { default: content, metadata: meta = {} } = await importMarkdown(locale, slug)

		return {
			...serverData,
			content,
			meta,
			slug
		}
	} catch {
		throw asError(404, `Could not find ${slug}`)
	}
}
