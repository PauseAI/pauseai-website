// generated using quicktype.io, edited: enums => literals

export default interface GetItems {
	entries: Entry[]
	has_more: boolean
}

export interface Entry {
	api_id: string
	calendar_api_id: string
	platform: string
	status: string
	submitted_by_user_api_id: string
	tags: Tag[]
	is_manager: boolean
	event: Event
	cover_image?: CoverImage
	calendar?: Calendar
	start_at?: Date
	hosts?: { [key: string]: null | string }[]
	guest_count?: number
	ticket_count?: number
	ticket_info?: TicketInfo
	featured_guests?: { [key: string]: null | string }[]
	role?: null
}

export interface Calendar {
	access_level: string
	api_id: string
	avatar_url: string
	cover_image_url: string
	description_short: null | string
	event_submission_restriction: string
	geo_city: null
	geo_country: null
	geo_latitude: null
	geo_longitude: null
	geo_region: null
	google_measurement_id: null
	instagram_handle: null | string
	launch_status: string
	linkedin_handle: null | string
	luma_plus_active: boolean
	meta_pixel_id: null
	name: string
	personal_user_api_id: null | string
	refund_policy: null
	slug: null | string
	social_image_url: null | string
	stripe_account_id: null
	tax_config: null
	tiktok_handle: null | string
	timezone: null | string
	tint_color: string
	track_meta_ads_from_luma: boolean
	twitter_handle: null | string
	verified_at: Date | null
	website: null | string
	youtube_handle: null | string
	is_personal: boolean
}

export interface CoverImage {
	vibrant_color: null
	colors: string[]
}

export interface Event {
	description_text?: string
	duration_interval: string
	geo_address_json?: GeoAddress
	geo_latitude: null | string
	geo_longitude: null | string
	host?: string
	name: string
	start_at: Date
	timezone: string
	url: string
	geo_address_info: GeoAddress | null
	api_id?: string
	calendar_api_id?: string
	cover_url?: string
	end_at?: Date
	event_type?: string
	hide_rsvp?: boolean
	location_type?: string
	one_to_one?: boolean
	recurrence_id?: null
	show_guest_list?: boolean
	user_api_id?: string
	visibility?: string
	waitlist_enabled?: boolean
	can_register_for_multiple_tickets?: boolean
	virtual_info?: VirtualInfo
	geo_address_visibility?: string
}

export interface GeoAddress {
	city: string
	type: 'google'
	region: string
	address: string
	country: string
	place_id: string
	city_state: string
	description: string
	full_address: string
	mode?: string
	latitude?: string
	longitude?: string
}

export interface VirtualInfo {
	has_access: boolean
}

export interface Tag {
	api_id: string
	name: string
	color: string
}

export interface TicketInfo {
	price: null
	is_free: boolean
	max_price: null
	is_sold_out: boolean
	spots_remaining: number | null
	is_near_capacity: boolean
	require_approval: boolean
	currency_info: null
}
