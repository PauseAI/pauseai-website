import { generateCacheControlRecord } from '$lib/utils'
import { json } from '@sveltejs/kit'
import { StatusCodes } from 'http-status-codes'

export type GeoApiResponse = App.Platform['context']['geo']

export const prerender = false

export function GET({ platform, setHeaders, url }) {
	const lat = url.searchParams.get('lat')
	const lon = url.searchParams.get('lon')
	const country = url.searchParams.get('country')

	if (lat != null && lon != null) {
		const geo: GeoApiResponse = {
			latitude: parseFloat(lat),
			longitude: parseFloat(lon),
			country: { code: country || 'US' }
		}
		setHeaders(generateCacheControlRecord({ private: true, maxAge: 60 * 60 }))
		return json(geo)
	}

	if (!platform) {
		console.warn('Skipping geo lookup, Platform not available in this environment')
		return new Response('Geo lookup is not available in this environment', {
			status: StatusCodes.NOT_IMPLEMENTED
		})
	}
	const geo: GeoApiResponse = platform.context.geo
	setHeaders(generateCacheControlRecord({ private: true, maxAge: 60 * 60 }))
	return json(geo)
}
