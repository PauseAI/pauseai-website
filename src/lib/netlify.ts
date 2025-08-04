export interface Platform {
	context: {
		geo: {
			/** name of the city */
			city?: string
			country?: {
				/** ISO 3166 code for the country */
				code?: string
				/** name of the country */
				name?: string
			}
			/** latitude of the location */
			latitude?: number
			/** longitude of the location */
			longitude?: number
			subdivision?: {
				/** ISO 3166 code for the country subdivision */
				code?: string
				/** name of the country subdivision */
				name?: string
			}
			/** timezone of the location */
			timezone?: string
			/** postal (zip) code of the location. We support all regional formats, so the format will vary */
			postalCode?: string
		}
	}
}
