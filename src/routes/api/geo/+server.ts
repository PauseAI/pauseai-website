import type { Platform } from '$lib/netlify'

export const prerender = false

export function GET({ platform }) {
	const netlifyPlatform = platform as Readonly<Platform>
	const geo = netlifyPlatform.context.geo
	return new Response(JSON.stringify(geo))
}
