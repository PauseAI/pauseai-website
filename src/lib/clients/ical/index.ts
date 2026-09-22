import * as ical from 'node-ical'

export type { CalendarResponse, EventInstance, VEvent } from 'node-ical'

export const expandRecurringEvent = ical.expandRecurringEvent

/**
 * The web address users land on when subscribing to a Google Calendar via its
 * `cid` share link. Public iCal feeds carry no per-event URL, so this doubles
 * as the link for the calendar's events.
 */
export function calendarUrl(calendarId: string): string {
	return `https://calendar.google.com/calendar/u/0?cid=${encodeURIComponent(calendarId)}`
}

/**
 * Deep link that opens the event's detail page instead of the whole calendar
 * (the eid is Google's `base64url("<UID local part> <calendar ID>")` format).
 * For expands of a recurring series this opens the recurring-event view of
 * the owning VEVENT; single events and one-off overrides open their exact
 * occurrence.
 */
export function eventUrl(uid: string, calendarId: string): string {
	const eid = Buffer.from(`${uid.replace(/@google\.com$/, '')} ${calendarId}`, 'utf8').toString(
		'base64url'
	)
	return `https://calendar.google.com/event?eid=${eid}`
}

/**
 * Fetches the public iCal feed Google Calendar serves for a calendar (the
 * same feed a subscriber's client polls) and returns its components indexed
 * by UID.
 */
export async function getCalendar(params: { calendarId: string }): Promise<ical.CalendarResponse> {
	const url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(
		params.calendarId
	)}/public/basic.ics`
	const response = await fetch(url, {
		headers: {
			// The feed needs no authentication, but a descriptive User-Agent keeps
			// the integration identifiable to Google, matching the other sync
			// scripts.
			'User-Agent': 'PauseAI-website-calendar-api (github.com/PauseAI/pauseai-website)'
		}
	})
	if (!response.ok) {
		throw new Error(`Calendar ${params.calendarId} responded with HTTP ${response.status}`)
	}
	const body = await response.text()
	return ical.sync.parseICS(body)
}

/** Narrows a parsed component to a VEVENT. */
export function isVEVENT(component: ical.CalendarResponse[string]): component is ical.VEvent {
	return (
		component != null &&
		typeof component === 'object' &&
		(component as ical.VEvent).type === 'VEVENT'
	)
}

/**
 * iCal property values can be plain strings or objects with
 * { val, params (LANGUAGE, ENCODING, ...) } when they carry parameters.
 */
export function text(value: unknown): string {
	if (typeof value === 'string') return value
	if (value && typeof value === 'object' && 'val' in value) {
		// Parameterized values stay strings after the val unwrap; anything else
		// yields no text.
		const inner: unknown = value.val
		return typeof inner === 'string' ? inner : ''
	}
	return ''
}
