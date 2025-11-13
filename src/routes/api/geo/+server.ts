import { error } from '@sveltejs/kit'
import { StatusCodes } from 'http-status-codes'

export const prerender = false

// re-export to hide implementation
export type { GeoApiResponse } from '$netlify/edge-functions/geo'

export function GET({ platform }) {
	if (!platform) {
		console.warn('Skipping geo lookup, Platform not available in this environment')
		return new Response('Geo lookup is not available in this environment', {
			status: StatusCodes.NOT_IMPLEMENTED
		})
	}
	// Route should be served from netlify/edge-functions/geo.ts
	return error(StatusCodes.INTERNAL_SERVER_ERROR)
}
