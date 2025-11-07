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
	id: string
	name: string
	notes?: string
	leader: string
	discordUsername?: string
	email?: string
	legalEntity: boolean
	overseer?: string
	public: boolean
} & Record<NationalGroupLink, string | undefined>

export type AirtableNationalGroup = {
	Name?: string
	Notes?: string
	/** Airtable IDs */
	Leader?: string[]
	leader_name?: string[]
	discord_username?: string[]
	onboarding_email?: string
	/** Interpreted as boolean ('Yes' => true) */
	'Legal entity'?: string
	/** Airtable IDs */
	Overseer?: string[]
	X?: string
	Discord?: string
	Whatsapp?: string
	website?: string
	linktree?: string
	instagram?: string
	tiktok?: string
	Facebook?: string
	youtube?: string
	linkedin?: string
	luma?: string
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
