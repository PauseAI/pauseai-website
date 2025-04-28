// file initialized by the Paraglide-SvelteKit CLI - Feel free to edit it
import type { Reroute } from '@sveltejs/kit'
import { deLocalizeUrl } from '$lib/paraglide/runtime'

export const reroute: Reroute = (request) => {
	return deLocalizeUrl(request.url).pathname
}
