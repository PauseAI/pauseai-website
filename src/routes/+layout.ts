import { loadTranslations } from '$lib/translations'
import { handleRedirects } from '$lib/utils'

export async function load({ url }) {
	const { lang, pathname } = handleRedirects(url)

	// Load translations
	await loadTranslations(lang, pathname)

	return { url, lang }
}
