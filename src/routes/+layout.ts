export const prerender = true
import { redirect } from '@sveltejs/kit'

export async function load({ url }) {
	if (url.host === 'pauseai.org') {
		return redirect(301, 'https://pauseai.info' + url.pathname)
	}
	return {
		url: url.pathname
	}
}
