import type { Reroute } from '@sveltejs/kit';

const HTML_EXT = '.html'

export const reroute: Reroute = ({ url }) => {
	if (url.pathname.endsWith(HTML_EXT)) {
		return '/_truncate/'
	}
	return
}
