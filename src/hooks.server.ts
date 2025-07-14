import { type Handle, type HandleServerError } from '@sveltejs/kit'
import { paraglideMiddleware } from '$lib/paraglide/server.js'

import { logs } from '@opentelemetry/api-logs'
import {
	LoggerProvider,
	SimpleLogRecordProcessor,
	ConsoleLogRecordExporter
} from '@opentelemetry/sdk-logs'

const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', locale)
		})
	})

const handleError: HandleServerError = ({ error, event, status, message }) => {
	// We need to ensure error handling does not throw
	try {
		const loggerProvider = new LoggerProvider({
			processors: [new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())]
		})
		logs.setGlobalLoggerProvider(loggerProvider)
		const logger = logs.getLogger('default')

		logger.emit({
			body: 'An error occurred during request handling',
			timestamp: Date.now(),
			attributes: {
				error: JSON.stringify(error),
				event: JSON.stringify(event),
				status: status,
				message: message
			}
		})
	} catch (err) {
		console.error('Error during error handling:', err)
		console.error('Original error:', error)
	}
}

export { handle, handleError }
