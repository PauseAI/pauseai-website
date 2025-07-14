import { type Handle, type HandleServerError } from '@sveltejs/kit'
import { paraglideMiddleware } from '$lib/paraglide/server.js'

const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', locale)
		})
	})

const handleError: HandleServerError = ({ error }) => {
	console.log(error)
}

export { handle, handleError }
