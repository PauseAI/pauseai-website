import { type Handle, type HandleServerError } from '@sveltejs/kit'
import { paraglideMiddleware } from '$lib/paraglide/server.js'
import * as pino from 'pino'

const transport = pino.transport({
	target: 'pino-opentelemetry-transport'
})
const logger = pino.pino(transport)

const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', locale)
		})
	})

const handleError: HandleServerError = ({ error, event, status, message }) => {
	console.error(error)
	logger.error({ error, event, status }, message)
}

export { handle, handleError }
