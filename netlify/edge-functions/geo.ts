import type { Context, EdgeFunction } from '@netlify/edge-functions'

export type GeoApiResponse = Context['geo']

export const config = {
	path: '/api/geo'
}

const handler: EdgeFunction = (_request, context) => {
	return new Response(JSON.stringify(context.geo), {
		headers: { 'Content-Type': 'application/json' }
	})
}

export default handler
