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

export type Signatory = {
	name: string
	private: boolean
	bio?: string
	country: string
	date: string
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
	public: boolean
} & Record<NationalGroupLink, string | undefined>

export type NationalGroupLink =
	| 'xLink'
	| 'discordLink'
	| 'whatsappLink'
	| 'website'
	| 'linktreeLink'
	| 'instagramLink'
	| 'tiktokLink'
	| 'facebookLink'
