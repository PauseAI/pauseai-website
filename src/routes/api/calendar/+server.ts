import * as luma from '$lib/clients/luma'

export type CalendarResponse = {
	entries: {
		event: Event
	}[]
}

export type Event = {
	name: string
	url: string
	geo_latitude: string | null
	geo_longitude: string | null
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
				geo_latitude: entry.event.geo_latitude,
				geo_longitude: entry.event.geo_longitude,
				start_at: entry.event.start_at
			}
		}))
	}
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})
	return new Response(JSON.stringify(response))
}
