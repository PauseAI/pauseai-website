import * as Calendar from '$lib/clients/luma/calendar'
import * as GoogleCalendar from '$lib/clients/ical'
import { geocode } from '$lib/geocode.js'
import { generateCacheControlRecord } from '$lib/utils.js'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import nationalChaptersJson from '$lib/data/national-chapters.json'

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

// The global calendar stays hardcoded; national chapter calendars are synced
// from Airtable into national-chapters.json by scripts/sync-national-chapters.ts
// (lumaCalendarId, resolved from each chapter's Luma page at sync time).
const GLOBAL_CALENDAR_ID = 'cal-E1qhLPs5IvlQr8S'
const CALENDAR_IDS = [
	GLOBAL_CALENDAR_ID,
	...nationalChaptersJson.communities
		.map((c) => c.lumaCalendarId)
		.filter((id): id is string => id != null)
]

// Google Calendars are pulled through their public iCal feeds (node-ical).
// `cid` share links carry the raw calendar ID.
const GOOGLE_CALENDAR_IDS = [
	'24db6e4f75a3f41c70a5001e1ec9eb278705a03491db2b4c436e21bb95e578ed@group.calendar.google.com'
]

// Recurring events have to be expanded into instances for a bounded window,
// so Google feeds are read ~one year ahead. The `days` filter below narrows
// what is actually served; this only bounds how far expansion is meaningful.
const GOOGLE_HORIZON_DAYS = 365

type GoogleLocation = { latitude: number; longitude: number }

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const daysStr = url.searchParams.get('days')
	const days = daysStr ? parseInt(daysStr) : null

	const allItems = await Promise.all(
		CALENDAR_IDS.map((id) =>
			Calendar.getItems({
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

	const googleFrom = new Date()
	const googleTo = new Date()
	googleTo.setDate(googleTo.getDate() + GOOGLE_HORIZON_DAYS)

	const googleCalendars = await Promise.all(
		GOOGLE_CALENDAR_IDS.map(async (calendarId) => ({
			calendarId,
			data: await GoogleCalendar.getCalendar({ calendarId })
		}))
	)

	for (const { calendarId, data } of googleCalendars) {
		const webUrl = GoogleCalendar.calendarUrl(calendarId)
		const vevents = Object.values(data).filter(GoogleCalendar.isVEVENT)
		for (const vevent of vevents) {
			const instances = GoogleCalendar.expandRecurringEvent(vevent, {
				from: googleFrom,
				to: googleTo
			})
			// Geocode each distinct location once — recurring occurrences share
			// their venue, and the per-process cache in $lib/geocode turns the
			// repeat hits into plain map lookups.
			const locationCoordinates = new Map<string, GoogleLocation | undefined>()
			for (const instance of instances) {
				const location = GoogleCalendar.text(instance.event.location)
				if (!location || locationCoordinates.has(location)) continue
				locationCoordinates.set(location, await geocode(location))
			}
			for (const instance of instances) {
				// Google marks dropped occurrences with STATUS:CANCELLED on their
				// RECURRENCE-ID override.
				if (instance.event.status === 'CANCELLED') continue
				const location = GoogleCalendar.text(instance.event.location)
				const coords = location ? locationCoordinates.get(location) : undefined
				mergedEntries.push({
					event: {
						name: GoogleCalendar.text(instance.summary),
						// Feeds carry no per-event URL; link to the calendar itself.
						url: webUrl,
						geo_latitude: coords?.latitude,
						geo_longitude: coords?.longitude,
						start_at: new Date(instance.start)
					}
				})
			}
		}
	}

	// De-duplicate by URL + start time — Google feeds repeat the calendar's
	// subscribe URL for every event, and the same Luma event can appear via
	// several chapter calendars.
	const uniqueEntries = Array.from(
		new Map(
			mergedEntries.map((entry) => [
				`${entry.event.url}|${entry.event.start_at.toISOString()}|${entry.event.name}`,
				entry
			])
		).values()
	)

	let filteredEntries = uniqueEntries

	if (days !== null && !isNaN(days)) {
		const now = new Date()
		const limit = new Date()
		limit.setDate(now.getDate() + days)

		filteredEntries = uniqueEntries.filter((entry) => {
			const startAt = entry.event.start_at
			return startAt >= now && startAt <= limit
		})
	}

	// Sort by start date
	filteredEntries.sort((a, b) => a.event.start_at.getTime() - b.event.start_at.getTime())

	const response: CalendarResponse = {
		entries: filteredEntries
	}

	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))
	return json(response)
}
