import type { Platform } from '$lib/netlify'
import { dev } from '$app/environment'

export type GeoApiResponse = Platform['context']['geo']

export const prerender = false

export function GET({ platform, setHeaders }) {
	if (dev) {
		console.warn('Skipping geo lookup in dev mode')
		return new Response('Geo lookup is not available in development mode', {
			status: 501
		})
	}
	const netlifyPlatform = platform as Readonly<Platform>
	const geo: GeoApiResponse = netlifyPlatform.context.geo
	setHeaders({
		'cache-control': 'private, max-age=3600' // local only, 1 hour in seconds
	})
	return new Response(JSON.stringify(geo))
}
