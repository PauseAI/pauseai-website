import type { Config, Context } from '@netlify/edge-functions'

// Geo Cookie Edge Function
//
// Sets a geo cookie on first visit using Netlify's edge geolocation data,
// then gets out of the way so the CDN can cache responses for returning visitors.
//
// Two-cookie pattern:
//   - geo_country: the actual country code, read by the client-side blocking script
//   - geo_set: a boolean flag used purely for CDN cache key variation (Netlify-Vary)
//
// Request flow:
//   1. First visit (no geo_set cookie)  → cookies set, response NOT cached (no-store)
//   2. Return visit (has geo_set, cold) → no cookies, CDN stores response (cache miss)
//   3. Subsequent visits (warm CDN)     → CDN serves directly, edge function skipped (hit)

export default async function geoCookie(request: Request, context: Context) {
	const cookieHeader = request.headers.get('cookie') || ''
	const hasGeoSet = /(?:^|;\s*)geo_set=1(?:;|$)/.test(cookieHeader)

	const response = await context.next()

	if (!hasGeoSet) {
		// First visit: set cookies, do not cache
		const country = context.geo?.country?.code
		const timezone = context.geo?.timezone

		if (country) {
			response.headers.append(
				'set-cookie',
				`geo_country=${country}; path=/; max-age=604800; SameSite=Lax; Secure`
			)
		}
		if (timezone) {
			response.headers.append(
				'set-cookie',
				`geo_timezone=${timezone}; path=/; max-age=604800; SameSite=Lax; Secure`
			)
		}

		// Always set geo_set so CDN can cache on next request
		response.headers.append('set-cookie', `geo_set=1; path=/; max-age=604800; SameSite=Lax; Secure`)

		response.headers.set('Netlify-CDN-Cache-Control', 'no-store')
		response.headers.set('Netlify-Vary', 'cookie=geo_set')

		return response
	}

	// Return visit: cacheable, no cookies set
	response.headers.set('Netlify-CDN-Cache-Control', 'public, s-maxage=3600, must-revalidate')
	response.headers.set('Netlify-Vary', 'cookie=geo_set')

	return response
}

export const config: Config = {
	path: '/*',
	excludedPath: ['/api/*'],
	cache: 'manual'
}
