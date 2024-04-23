export type Categories = 'sveltekit' | 'svelte'

export type Post = {
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
export type Person = {
	id: string
	name: string
	/** URL to image file */
	image: string
	bio: string
	title?: string
}

export type Team = {
	id: string
	name: string
	description: string
	lead: string
}
