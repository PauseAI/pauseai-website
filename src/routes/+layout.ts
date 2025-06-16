export const prerender = true

import { dev } from '$app/environment'
import { locales, setLocale } from '$lib/paraglide/runtime'
import { handleRedirects } from '$lib/redirects'
import type { Load } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

export const load: Load = async ({ url, url: { host, pathname }, fetch }) => {
	// Extract the first path segment to check if it's a locale
	const firstSegment = pathname.split('/')[1] || ''

	// Helper function to check if a string is in the locales array
	// This handles the TypeScript type limitations with the locales array
	const isValidLocale = (segment: string): boolean => {
		return locales.some((locale: string) => locale === segment)
	}

	// Only set the locale if the first segment is a valid locale from the runtime
	// For all other paths, the base locale will be used by default
	if (firstSegment && isValidLocale(firstSegment)) {
		setLocale(firstSegment as any, { reload: false })
	}

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
