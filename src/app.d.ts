import type { Locale } from '$lib/paraglide/runtime.js'
import type { Context } from '@netlify/edge-functions'
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

	interface Twttr {
		ready: (callback: () => void) => void
		load: (element: HTMLElement) => void
	}

	interface Window {
		twttr?: Twttr
	}
}

declare module '*.md' {
	import type { SvelteComponent } from 'svelte'

	export default class Comp extends SvelteComponent {
		$$prop_def: Record<string, never>
	}
	export const metadata: Record<string, unknown>
}
