export type Categories = 'sveltekit' | 'svelte'

export type FrontmatterMeta = {
	title: string
	/** Meta description for SEO */
	description: string
	author?: string
	/** Date in YYYY-MM-DD format */
	date?: string
	categories?: Categories[]
	image?: string
}

export type Post = FrontmatterMeta & {
	/** Path in URL from root */
	slug: string
}

/** Individual volunteer */
export type Person = {
	id: string
	name: string
	/** URL to image file */
	image?: string
	bio: string
	title?: string
	/** Doesn't want to be visible on the /people page */
	privacy?: boolean
	checked?: boolean
	org?: ['international' | string]
}

export type Team = {
	id: string
	name: string
	description: string
	leadName: string
	leadEmail: string
	public: boolean
	responsibilities: string[]
}

export type NationalGroup = {
	id: string
	name: string
	notes?: string
	leader: string
	discordUsername?: string
	email?: string
	legalEntity: boolean
	overseer: string
	xLink?: string
	discordLink?: string
	whatsappLink?: string
	website?: string
	linktreeLink?: string
	instagramLink?: string
	tiktokLink?: string
	public: boolean
}
