export type Categories = 'sveltekit' | 'svelte'

export interface Post {
	title: string
	/** Path in URL from root */
	slug: string
	/** Meta description for SEO */
	description: string
	/**
	 * Date in YYYY-MM-DD format
	 */
	date: string
	categories: Categories[]
}

/** Individual volunteer */
export interface Person {
	id: string
	name: string
	/** URL to image file */
	image: string
	bio: string
	title?: string
	/** Doesn't want to be visible on the /people page */
	privacy?: boolean
}

export interface Team {
	id: string
	name: string
	description: string
	leadName: string
	leadEmail: string
}
