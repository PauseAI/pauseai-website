import * as luma from '$lib/clients/luma'
import { generateCacheControlRecord } from '$lib/utils.js'
import { json } from '@sveltejs/kit'

export type CalendarResponse = {
	entries: {
		event: Event
	}[]
}

export type Event = {
	name: string
	url: string
	geo_latitude: number | undefined
	geo_longitude: number | undefined
	start_at: Date
}

export const prerender = false

const CALENDAR_ID = 'cal-E1qhLPs5IvlQr8S'

export async function GET({ setHeaders }) {
	const items = await luma.Calendar.getItems({
		calendarApiId: CALENDAR_ID,
		period: 'future',
		paginationLimit: 20
	})
	const response: CalendarResponse = {
		entries: items.entries.map((entry) => ({
			event: {
				name: entry.event.name,
				url: entry.event.url,
				geo_latitude: entry.event.coordinate?.latitude,
				geo_longitude: entry.event.coordinate?.longitude,
				start_at: entry.event.start_at
			}
		}))
	}
	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))
	return json(response)
}
