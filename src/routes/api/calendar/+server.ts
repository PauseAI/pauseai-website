import * as luma from '$lib/clients/luma'
import { generateCacheControlRecord } from '$lib/utils.js'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

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

const CALENDAR_IDS = [
	'cal-E1qhLPs5IvlQr8S', // global
	'cal-Z327EhtiFdHuVie', // UK
	'cal-EvzL9fKA3SCSrOq', // US
	'cal-gnpo62PdSdau7KQ' // AU
]

export const GET: RequestHandler = async ({ setHeaders }) => {
	const allItems = await Promise.all(
		CALENDAR_IDS.map((id) =>
			luma.Calendar.getItems({
				calendarApiId: id,
				period: 'future',
				paginationLimit: 20
			})
		)
	)

	const mergedEntries = allItems.flatMap((items) =>
		items.entries.map((entry) => ({
			event: {
				name: entry.event.name,
				url: entry.event.url,
				geo_latitude: entry.event.coordinate?.latitude,
				geo_longitude: entry.event.coordinate?.longitude,
				start_at: new Date(entry.event.start_at)
			}
		}))
	)

	// De-duplicate by URL
	const uniqueEntries = Array.from(
		new Map(mergedEntries.map((entry) => [entry.event.url, entry])).values()
	)

	// Sort by start date
	uniqueEntries.sort((a, b) => a.event.start_at.getTime() - b.event.start_at.getTime())

	const response: CalendarResponse = {
		entries: uniqueEntries
	}

	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))
	return json(response)
}
