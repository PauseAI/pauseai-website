// generated using quicktype.io, edited: enums => literals / string

export default interface Post {
	id: number
	editor_v2: boolean
	publication_id: number
	type: 'newsletter'
	title: string
	social_title: null
	section_id: null
	search_engine_title: null
	search_engine_description: null
	subtitle: string
	slug: string
	post_date: Date
	podcast_url: string
	podcast_art_url: null
	podcast_duration: null
	video_upload_id: null
	podcast_upload_id: null
	podcast_preview_upload_id: null
	audience: string
	should_send_free_preview: boolean
	write_comment_permissions: string
	show_guest_bios: boolean
	free_unlock_required: boolean
	default_comment_sort: null
	canonical_url: string
	audience_before_archived: null
	exempt_from_archive_paywall: boolean
	teaser_post_eligible: boolean
	restacks: number
	reactions: Reactions
	top_exclusions: any[]
	pins: any[]
	section_pins: any[]
	previous_post_slug: string
	next_post_slug: null | string
	cover_image: string
	cover_image_is_square: boolean
	cover_image_is_explicit: boolean
	videoUpload: null
	podcastFields: PodcastFields
	podcastUpload: null
	podcastPreviewUpload: null
	voiceover_upload_id: null
	voiceoverUpload: null
	has_voiceover: boolean
	description: string
	body_html: string
	truncated_body_text: string
	wordcount: number
	postTags: PostTag[]
	postCountryBlocks: any[]
	coverImagePalette: CoverImagePalette
	publishedBylines: PublishedByline[]
	reaction: null
	reaction_count: number
	comment_count: number
	child_comment_count: number
	audio_items?: AudioItem[]
	is_geoblocked: boolean
	hasCashtag: boolean
}

export interface AudioItem {
	post_id: number
	voice_id: string
	audio_url: string
	type: string
	status: string
}

export interface CoverImagePalette {
	Vibrant: DarkMuted
	DarkVibrant: DarkMuted
	LightVibrant: DarkMuted
	Muted: DarkMuted
	DarkMuted: DarkMuted
	LightMuted: DarkMuted
}

export interface DarkMuted {
	rgb: number[]
	population: number
}

export interface PodcastFields {
	post_id: number
	podcast_episode_number: null
	podcast_season_number: null
	podcast_episode_type: null
	should_syndicate_to_other_feed: null
	syndicate_to_section_id: null
	hide_from_feed: boolean
	free_podcast_url: null
	free_podcast_duration: null
}

export interface PostTag {
	id: string
	publication_id: number
	name: string
	slug: string
	hidden: boolean
}

export interface PublishedByline {
	id: number
	name: string
	handle: string
	previous_name: null
	photo_url: string
	bio: string
	profile_set_up_at: Date
	publicationUsers: PublicationUser[]
	is_guest: boolean
	bestseller_tier: null
}

export interface PublicationUser {
	id: number
	user_id: number
	publication_id: number
	role: string
	public: boolean
	is_primary: boolean
	publication: Publication
}

export interface Publication {
	id: number
	name: string
	subdomain: string
	custom_domain: null
	custom_domain_optional: boolean
	hero_text: string
	logo_url: string
	author_id: number
	theme_var_background_pop: string
	created_at: Date
	rss_website_url: null
	email_from_name: string
	copyright: string
	founding_plan_name: string
	community_enabled: boolean
	invite_only: boolean
	payments_state: string
	language: null
	explicit: boolean
	is_personal_mode: boolean
}

export interface Reactions {
	'❤': number
}
