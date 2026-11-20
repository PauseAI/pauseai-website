import * as Calendar from '$lib/clients/luma/calendar'
import { getChapter } from '$lib/materials/chapters'
import { toCalendarEvents, type CalendarEvent } from '$lib/materials/eventText'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export type ToolsEventsResponse = CalendarEvent[]

export const prerender = false

/**
 * Upcoming events for the materials maker's "start from one of our events": the chosen chapter's Luma calendar, or
 * PauseAI's own when no chapter (or one without a calendar) is chosen. `?chapter=` takes a chapter's English name.
 */
export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const chapter = getChapter(url.searchParams.get('chapter') ?? '')
	const calendarApiId = chapter.lumaCalendarId ?? Calendar.GLOBAL_CALENDAR_ID
	try {
		const items = await Calendar.getItems({ calendarApiId, period: 'future', paginationLimit: 20 })
		setHeaders({ 'cache-control': 'public, max-age=900' })
		return json(toCalendarEvents(items.entries.map((e) => e.event)) satisfies ToolsEventsResponse)
	} catch (error) {
		console.error('Could not load events for the materials maker:', error)
		// The tool works without events: the option to start from one is just not offered.
		return json([] satisfies ToolsEventsResponse)
	}
}
