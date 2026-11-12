import type { Reroute } from '@sveltejs/kit/hooks'

// file initialized by the Paraglide-SvelteKit CLI - Feel free to edit it
import { deLocalizeUrl } from '#lib/paraglide/runtime.js'

export const reroute: Reroute = (request) => {
	return deLocalizeUrl(request.url).pathname
}
