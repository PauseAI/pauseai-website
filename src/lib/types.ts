import type { SvelteHTMLElements } from 'svelte/elements'
import type { Attachment } from 'airtable'
import type { DeepPartial } from './utils'

export type Categories = 'sveltekit' | 'svelte' | 'AI Safety' | 'Transparency' | 'Government'

export type LinkType = 'internal' | 'external' | 'mail'

export type FrontmatterMeta = {
	title: string
	/** Meta description for SEO */
	description: string
	author?: string
	/** Date in YYYY-MM-DD format */
	date?: string
	categories?: Categories[]
	image?: string
	showImage?: boolean
	/** If true, this post will appear in the Latest News section on the homepage */
	news?: boolean
}

export type Post = FrontmatterMeta & {
	/** Path in URL from root */
	slug: string
}

export type NewsItem = {
	title: string
	subtitle: string
	date: string
	image?: string
	outlet?: string
	/** URL to the article (internal path or external URL) */
	href: string
	source: 'internal' | 'substack' | 'press'
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

export type AirtablePerson = {
	'Full name': string
	Bio2: string
	Title?: string
	Photo?: ReadonlyArray<DeepPartial<Attachment>>
	Privacy: boolean
	About: boolean
	duplicate?: boolean
	'About order'?: number
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

export type Picture = Exclude<SvelteHTMLElements['enhanced:img']['src'], string>

export type CarouselQuote = {
	text: string
	author: string
	title: string
	image: Picture
	href?: string
}
