// Static (build-time) env on purpose: $env/dynamic/public in any client chunk
// makes prerendered pages block hydration on a runtime fetch of /_app/env.js
// from the SSR function. See the same note in hooks.client.ts.
import * as publicEnv from '$env/static/public'

export type TurnstileApi = {
	render: (element: HTMLElement, options: Record<string, unknown>) => string
	reset: (widgetId: string) => void
	remove: (widgetId: string) => void
}

/** Public by design — it has to appear in the page for the widget to render. */
export const turnstileSiteKey = (publicEnv as Record<string, string | undefined>)
	.PUBLIC_TURNSTILE_SITE_KEY

/**
 * Our own field name for the token, rather than Turnstile's auto-injected
 * `cf-turnstile-response`, so a form can never end up with two same-named inputs.
 */
export const TURNSTILE_FIELD = 'turnstile_token'

const ONLOAD_CALLBACK = 'onPauseAITurnstileLoad'

let loadPromise: Promise<TurnstileApi> | undefined

/** Loads api.js once per page, however many widgets mount. */
export function loadTurnstile(): Promise<TurnstileApi> {
	loadPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
		if (window.turnstile) {
			resolve(window.turnstile)
			return
		}

		window[ONLOAD_CALLBACK] = () => {
			if (window.turnstile) resolve(window.turnstile)
			else reject(new Error('Turnstile loaded without exposing its API'))
		}

		const script = document.createElement('script')
		script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${ONLOAD_CALLBACK}`
		script.async = true
		script.defer = true
		script.onerror = () => reject(new Error('Failed to load Turnstile'))
		document.head.append(script)
	})

	return loadPromise
}
