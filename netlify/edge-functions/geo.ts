import type { Context, EdgeFunction } from '@netlify/edge-functions'
import Headers from '@remix-run/headers'
import { headersToRecord } from '../../src/lib/utils'

export type GeoApiResponse = Context['geo']

export const config = {
	path: '/api/geo'
}

const handler: EdgeFunction = (_request, context) => {
	const headers = new Headers({
		contentType: 'application/json'
	})
	return new Response(JSON.stringify(context.geo), { headers: headersToRecord(headers) })
}

export default handler
