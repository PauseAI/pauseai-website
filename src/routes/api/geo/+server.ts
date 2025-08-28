import { generateCacheControlRecord } from '$lib/utils'
import { json } from '@sveltejs/kit'

export type GeoApiResponse = App.Platform['context']['geo']

export const prerender = false

export function GET({ platform, setHeaders }) {
	if (!platform) {
		console.warn('Skipping geo lookup, Platform not available in this environment')
		return new Response('Geo lookup is not available in this environment', {
			status: 501
		})
	}
	const geo: GeoApiResponse = platform.context.geo
	setHeaders(generateCacheControlRecord({ private: true, maxAge: 60 * 60 }))
	return json(geo)
}
