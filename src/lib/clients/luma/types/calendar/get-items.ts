// generated using quicktype.io

export default interface GetItems {
	entries: Entry[]
	has_more: boolean
}

export interface Entry {
	api_id: string
	event: Event
	cover_image: CoverImage
	calendar: Calendar
	start_at: Date
	hosts: { [key: string]: null | string }[]
	guest_count: number
	ticket_count: number
	ticket_info: TicketInfo
	featured_guests: { [key: string]: null | string }[]
	role: null
	calendar_api_id: string
	is_manager: boolean
	platform: string
	status: string
	submitted_by_user_api_id: string
	tags: any[]
}

export interface Calendar {
	access_level: string
	api_id: string
	avatar_url: string
	coordinate: null
	cover_image_url: string
	description_short: null | string
	event_submission_restriction: string
	geo_city: null
	geo_country: null
	geo_region: null
	google_measurement_id: null
	instagram_handle: null | string
	is_blocked: boolean
	launch_status: string
	linkedin_handle: null | string
	luma_plus_active: boolean
	meta_pixel_id: null
	name: string
	personal_user_api_id: null | string
	refund_policy: null
	show_subscriber_count: boolean
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
	api_id: string
	calendar_api_id: string
	cover_url: string
	end_at: Date
	event_type: string
	hide_rsvp: boolean
	location_type: string
	name: string
	one_to_one: boolean
	recurrence_id: null
	show_guest_list: boolean
	start_at: Date
	timezone: string
	url: string
	user_api_id: string
	visibility: string
	waitlist_enabled: boolean
	virtual_info: VirtualInfo
	geo_address_info: GeoAddressInfo | null
	geo_address_visibility: string
	coordinate: Coordinate | null
}

export interface Coordinate {
	longitude: number
	latitude: number
}

export interface GeoAddressInfo {
	city: string
	type: string
	region: string
	address: string
	country: string
	place_id: string
	city_state: string
	description: string
	country_code: string
	full_address: string
	apple_maps_place_id: string
	mode: string
}

export interface VirtualInfo {
	has_access: boolean
}

export interface TicketInfo {
	price: null
	is_free: boolean
	max_price: null
	is_sold_out: boolean
	spots_remaining: null
	is_near_capacity: boolean
	require_approval: boolean
	currency_info: null
}
