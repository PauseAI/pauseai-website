export interface Platform {
	context: {
		geo: {
			city?: string
			country?: {
				code?: string
				name?: string
			}
			subdivision?: {
				code?: string
				name?: string
			}
			latitude?: number
			longitude?: number
			timezone?: string
		}
	}
}
