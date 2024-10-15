import { building } from '$app/environment'
import { i18n } from '$lib/i18n'
import { redirect, type Handle } from '@sveltejs/kit'
import * as runtime from '$lib/paraglide/runtime'

const LANG_PLACEHOLDER = '%paraglide.lang%'
const DIRECTION_PLACEHOLDER = '%paraglide.textDirection%'

const paraglideHandle = i18n.handle({
	disableAsyncLocalStorage: true,
	langPlaceholder: LANG_PLACEHOLDER,
	textDirectionPlaceholder: DIRECTION_PLACEHOLDER
})

export const handle: Handle = async function ({ event, resolve }) {
	// emulate Paraglide hook without requesting headers etc
	if (building) {
		const pathname = event.url.pathname
		const firstElement = pathname.substring(1).split('/')[0]
		const languageFromUrl = runtime.isAvailableLanguageTag(firstElement) ? firstElement : null
		if (!languageFromUrl) {
			redirect(302, '/' + runtime.sourceLanguageTag + pathname)
		}
		runtime.setLanguageTag(languageFromUrl)
		//@ts-ignore
		const direction = new Intl.Locale(languageFromUrl).textInfo.direction
		return await resolve(event, {
			transformPageChunk({ html, done }) {
				if (!done) return
				return html
					.replace(LANG_PLACEHOLDER, runtime.languageTag())
					.replace(DIRECTION_PLACEHOLDER, direction)
			}
		})
	} else {
		return paraglideHandle({ event, resolve })
	}
}
