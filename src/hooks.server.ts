import { building } from '$app/environment'
import { i18n } from '$lib/i18n'
import { redirect, type Handle } from '@sveltejs/kit'
import * as runtime from '$lib/paraglide/runtime'
import { sequence } from '@sveltejs/kit/hooks'

const LANG_PLACEHOLDER = '%paraglide.lang%'
const DIRECTION_PLACEHOLDER = '%paraglide.textDirection%'

const paraglideHandle = i18n.handle({
	disableAsyncLocalStorage: true,
	langPlaceholder: LANG_PLACEHOLDER,
	textDirectionPlaceholder: DIRECTION_PLACEHOLDER
})

const emulateOrCallParaglide: Handle = async function ({ event, resolve }) {
	// emulate Paraglide hook without requesting headers etc
	if (building) {
		const pathname = event.url.pathname
		const firstElement = pathname.substring(1).split('/')[0]
		const languageFromUrl = runtime.isAvailableLanguageTag(firstElement) ? firstElement : null
		if (!languageFromUrl) {
			redirect(302, i18n.resolveRoute(pathname, i18n.config.defaultLanguageTag))
		}
		runtime.setLanguageTag(languageFromUrl)
		//@ts-expect-error types assume browser environment, node differs
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

const addCacheHeaderToParaglideRedirect: Handle = async function ({ event, resolve }) {
	const response = await resolve(event)
	if (isParaglideRedirect(event, response)) {
		response.headers.set('cache-control', 'public, max-age=3600') // 1 hour in seconds
	}
	return response
}

function isParaglideRedirect(event: Parameters<Handle>[0]['event'], response: Response) {
	if (response.status != 302) return false
	const location = response.headers.get('location')
	if (!location) return false
	const canonical = i18n.route(location)
	if (canonical != event.url.pathname) return false
	return true
}

export const handle = sequence(addCacheHeaderToParaglideRedirect, emulateOrCallParaglide)
