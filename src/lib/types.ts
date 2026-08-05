import type { Picture } from 'vite-imagetools'
import type { Attachment } from 'airtable'
import type { DeepPartial } from './utils'

export type { Picture }

/**
 * Like `Picture`, but with optional intrinsic dimensions so callers that
 * don't know the image size (e.g. NetlifyImage) don't have to fabricate
 * width/height values.
 */
export type LoosePicture = Omit<Picture, 'img'> & {
	img: Partial<Picture['img']> & Pick<Picture['img'], 'src'>
}

export type Categories = 'sveltekit' | 'svelte' | 'AI Safety' | 'Transparency' | 'Government'

export type LinkType = 'internal' | 'external' | 'mail'

/**
 * A banner selection rule. `dateRange` is `[startsOn, endsOn]` in `YYYY-MM-DD`
 * format; either bound may be `null` for unbounded. `countries` is `null` for
 * a global banner, or a list of ISO country codes for geo-targeted banners.
 */
export type BannerRule = {
	id: string
	dateRange: [string | null, string | null]
	countries?: string[] | null
}

type StrictFrontmatterMeta = {
	title: string
	/** Overrides title in the page <title> / social meta tags when the on-page H1 should differ */
	metaTitle?: string
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
	/**
	 * List of all image URLs referenced in the markdown body, injected by the
	 * `remark-collect-images` plugin. Not authored in frontmatter.
	 */
	_images?: string[]
}

/** Descriptive frontmatter where everything is optional (for markdown parsing) */
export type DescriptiveFrontmatterMeta = Partial<StrictFrontmatterMeta>

export type StrictPost<T = StrictFrontmatterMeta> = T & {
	/** Path in URL from root */
	slug: string
}

export type DescriptivePost = StrictPost<DescriptiveFrontmatterMeta>

export type NewsItem = {
	title: string
	subtitle: string
	date: string
	image?: string
	/**
	 * Resolved enhanced-image Picture object for internal news items whose `image`
	 * points at a static asset. Resolved server-side by /api/news so the client
	 * bundle doesn't need the import.meta.glob resolver.
	 */
	picture?: Picture | null
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

export type CarouselQuote = {
	text: string
	author: string
	title: string
	image: Picture
	href?: string
}
