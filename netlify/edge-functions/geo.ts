import type { Config, Context, EdgeFunction } from '@netlify/edge-functions'

export type GeoApiResponse = Context['geo']

export const config: Config = {
	path: '/api/geo'
}

const handler: EdgeFunction = (_request, context) => {
	const response: GeoApiResponse = context.geo
	return new Response(JSON.stringify(response), {
		headers: { 'Content-Type': 'application/json' }
	})
}

export default handler
