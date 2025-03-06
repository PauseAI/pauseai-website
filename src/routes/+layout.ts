export const prerender = true
import { handleRedirects } from '$lib/redirects'
import { redirect } from '@sveltejs/kit'

export async function load({ url: { host, pathname: url } }) {
	handleRedirects(url)
	if (host === 'pauseai.org') {
		return redirect(301, 'https://pauseai.info' + url)
	}
	return { url }
}
