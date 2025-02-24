export const prerender = true

import { redirect } from '@sveltejs/kit'
import { i18n } from '$lib/i18n'

export async function load({ url, url: { host, pathname } }) {
	// load functions run before wrapper component which normally sets language tag for client
	const language = i18n.getLanguageFromUrl(url)
	const runtime = i18n.config.runtime
	runtime.setLanguageTag(language)

	if (host === 'pauseai.org') {
		return redirect(301, 'https://pauseai.info' + pathname)
	}
	return { url: pathname }
}
