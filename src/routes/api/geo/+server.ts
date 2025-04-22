import type { Platform } from '$lib/netlify'

export const prerender = false

export function GET({ platform, setHeaders }) {
	const netlifyPlatform = platform as Readonly<Platform>
	const geo = netlifyPlatform.context.geo
	setHeaders({
		'cache-control': 'private, max-age=3600' // local only, 1 hour in seconds
	})
	return new Response(JSON.stringify(geo))
}
