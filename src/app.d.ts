import type { Locale } from '$lib/paraglide/runtime.js'
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			locale: Locale
		}
		// interface PageData {}
		// interface Platform {}
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
	import type { SvelteComponentDev } from 'svelte/internal'

	export default class Comp extends SvelteComponentDev {
		$$prop_def: {}
	}
	export const metadata: Record<string, any>
}
