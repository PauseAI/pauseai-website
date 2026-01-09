import type { EnhancedImgAttributes } from '@sveltejs/enhanced-img'

export type Categories = 'sveltekit' | 'svelte' | 'AI Safety' | 'Transparency' | 'Government'

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

export type AirtableSignatory = {
	name: string
	private: boolean
	bio?: string
	country: string
	date: string
	email_verified?: boolean
	duplicate?: boolean
}

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
	duplicate?: boolean
	order?: number
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

export type AirtableTeam = {
	name: string
	mission: string
	name_from_lead: string
	email_address_from_lead: string
	responsibilities_names: string[]
	public: boolean
}

export type NationalGroup = {
	name: string
	leader: string
	email?: string
	description?: string
	image?: string
	id: string
	public: boolean
} & Record<NationalGroupLink, string | undefined>

export type AirtableNationalGroup = {
	country?: string
	leaders_name?: string[]
	discord_username?: string[]
	website_email?: string
	x?: string
	discord?: string
	whatsapp?: string
	website?: string
	linktree?: string
	instagram?: string
	tiktok?: string
	facebook?: string
	youtube?: string
	linkedin?: string
	luma?: string
	substack?: string
	image?: { url: string }[]
}

export type NationalGroupLink =
	| 'xLink'
	| 'discordLink'
	| 'whatsappLink'
	| 'website'
	| 'linktreeLink'
	| 'instagramLink'
	| 'tiktokLink'
	| 'facebookLink'
	| 'youtubeLink'
	| 'linkedinLink'
	| 'lumaLink'
	| 'substackLink'

export type Picture = Exclude<EnhancedImgAttributes['src'], string>

export type CarouselQuote = {
	text: string
	author: string
	title: string
	image: Picture
}
