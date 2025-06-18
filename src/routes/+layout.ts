export const prerender = true

import { dev } from '$app/environment'
import { locales, setLocale } from '$lib/paraglide/runtime'
import { handleRedirects } from '$lib/redirects'
import type { Load } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

export const load: Load = async ({ url, url: { host, pathname }, fetch }) => {
	handleRedirects(pathname)

	if (host === 'pauseai.org') {
		return redirect(301, 'https://pauseai.info' + pathname)
	}

	let localeAlert = null

	// Check for environment vs runtime mismatches in development
	if (dev) {
		try {
			// Fetch current server-side environment-calculated locales
			const response = await fetch('/api/locale-env')
			const serverData = await response.json()
			// Get client-side runtime locales
			const runtimeLocales = Array.from(locales)

			// Compare server's environment-calculated locales with client runtime locales
			const envLocalesStr = JSON.stringify(serverData.envLocales)
			const runtimeLocalesStr = JSON.stringify(runtimeLocales)
			let comparison = `Environment yields locales ${envLocalesStr} while runtime has ${runtimeLocalesStr}`
			if (envLocalesStr !== runtimeLocalesStr) {
				comparison += ' - shut-down the server and re-run pnpm dev'
				localeAlert = { message: comparison, isDev: true }
			}
			// console.debug(comparison)
		} catch (error) {
			console.error('Failed to check locale environment consistency:', error)
		}
	}

	return {
		url: pathname,
		localeAlert
	}
}
