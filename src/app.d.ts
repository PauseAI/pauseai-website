// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}
declare module '*.md' {
	import type { SvelteComponent } from 'svelte'

	export default class Comp extends SvelteComponent {}

	export interface PostMetadata {
		title?: string
		date?: string
		description?: string
		image?: string
		[key: string]: unknown
	}

	export const metadata: PostMetadata
}
