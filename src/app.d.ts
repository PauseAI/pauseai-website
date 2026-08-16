import type { Locale } from '$lib/paraglide/runtime.js'
import type { TurnstileApi } from '$lib/turnstile'
import type { Context } from '@netlify/edge-functions'
import type { Picture } from 'vite-imagetools'
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			locale: Locale
		}
		// interface PageData {}
		interface Platform {
			context: Context
		}
	}

	interface Response {
		json(): Promise<unknown> // Override "any"
	}

	interface Twttr {
		ready: (callback: () => void) => void
		load: (element: HTMLElement) => void
	}

	interface Window {
		twttr?: Twttr
		selectBanners(): void
		applyTheme(): void
		dataLayer?: unknown[]
		turnstile?: TurnstileApi
		onPauseAITurnstileLoad?: () => void
	}

	declare module '*.md' {
		import type { SvelteComponent } from 'svelte'

		export default class Comp extends SvelteComponent {
			$$prop_def: Record<string, never>
		}
		export const metadata: Record<string, unknown>
	}

	// vite-imagetools `?picture` shorthand — returns a Picture object
	// ({ sources, img }) for rendering a <picture> tag.
	declare module '*?picture' {
		const value: Picture
		export default value
	}
}
