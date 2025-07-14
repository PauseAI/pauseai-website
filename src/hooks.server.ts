import { type Handle, type HandleServerError } from '@sveltejs/kit'
import { paraglideMiddleware } from '$lib/paraglide/server.js'

import logsAPI from '@opentelemetry/api-logs'
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
		logsAPI.logs.setGlobalLoggerProvider(loggerProvider)
		const logger = logsAPI.logs.getLogger('default')

		logger.emit({
			body: 'An error occurred during request handling',
			timestamp: Date.now(),
			attributes: {
				'request.url': event.request.url,
				'request.method': event.request.method,
				'error.message': message,
				'error.status': status,
				'error.stack': error instanceof Error ? error.stack : String(error)
			}
		})
	} catch (err) {
		console.error('Error during error handling:', err)
		console.error('Original error:', error)
	}
}

export { handle, handleError }
