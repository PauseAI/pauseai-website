import { PUBLIC_UNDER_CONSTRUCTION } from '$env/static/public'

export async function handle({ event, resolve }) {
	if (PUBLIC_UNDER_CONSTRUCTION === 'true') {
		return new Response('Site is under construction', { status: 503 })
	}
	return await resolve(event)
}
