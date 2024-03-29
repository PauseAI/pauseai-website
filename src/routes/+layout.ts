export const prerender = true
import { redirect } from '@sveltejs/kit'

export async function load({ url: { host, pathname: url } }) {
	if (host === 'pauseai.org') {
		return redirect(301, 'https://pauseai.info' + url)
	}
	return { url }
}
