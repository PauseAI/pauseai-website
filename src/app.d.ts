import type { AvailableLanguageTag } from '../../lib/paraglide/runtime'
import type { ParaglideLocals } from '@inlang/paraglide-sveltekit'
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			paraglide: ParaglideLocals<AvailableLanguageTag>
		}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module '*.md' {
	import type { SvelteComponentDev } from 'svelte/internal'

	export default class Comp extends SvelteComponentDev {
		$$prop_def: {}
	}
	export const metadata: Record<string, any>
}
