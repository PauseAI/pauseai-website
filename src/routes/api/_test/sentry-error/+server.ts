import type { RequestHandler } from './$types'

export const GET: RequestHandler = () => {
	throw new Error('Sentry test: intentional server-side error')
}
