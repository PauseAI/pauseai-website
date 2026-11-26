/** The parts of a Luma calendar event (see $lib/clients/luma) the tools read. Dates arrive as strings. */
export interface LumaEvent {
	url: string
	name: string
	start_at: string | Date
	end_at?: string | Date
	timezone?: string | null
	geo_address_info?: { address?: string; city?: string } | null
	/** "offline" for an event in person, even when Luma keeps its address for guests only. */
	location_type?: string
}

/** An upcoming event from a chapter's (or PauseAI's) Luma calendar, trimmed to what the materials tools need. Plain data for the client. */
export interface CalendarEvent {
	/** Luma's short id, used as the React key and in the link. */
	id: string
	name: string
	startAt: string
	endAt?: string
	timezone?: string
	/** "Venue, City", or "Online" when Luma has no address, or blank when it's in person but we can't say where. */
	venue: string
	city?: string
}

export function toCalendarEvents(events: LumaEvent[]): CalendarEvent[] {
	return events.map((event) => {
		const e = event
		const geo = e.geo_address_info
		const venue = [geo?.address, geo?.city]
			.filter(Boolean)
			.filter((v, i, all) => all.indexOf(v) === i)
			.join(', ')
		return {
			id: e.url,
			name: e.name,
			startAt: new Date(e.start_at).toISOString(),
			endAt: e.end_at ? new Date(e.end_at).toISOString() : undefined,
			timezone: e.timezone ?? undefined,
			// In person but with nowhere to say (a guests-only venue, without a town): left for the user to fill in.
			venue: venue || (geo || e.location_type === 'offline' ? '' : 'Online'),
			city: geo?.city || undefined
		}
	})
}

/** Luma sometimes sends a zone Intl does not know, so fall back to UTC rather than throw. */
const validTimeZone = (tz?: string) => {
	try {
		new Intl.DateTimeFormat('en-GB', { timeZone: tz || 'UTC' })
		return tz || 'UTC'
	} catch {
		return 'UTC'
	}
}

/** "Wednesday 28 October", with the year added when it is not this year. */
export function formatDay(date: Date, timeZone: string, now = new Date()): string {
	const parts = (d: Date) =>
		Object.fromEntries(
			new Intl.DateTimeFormat('en-GB', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				timeZone
			})
				.formatToParts(d)
				.map((p) => [p.type, p.value])
		)
	const p = parts(date)
	const thisYear = parts(now).year
	return `${p.weekday} ${p.day} ${p.month}${p.year !== thisYear ? ` ${p.year}` : ''}`
}

/** "7pm" or "6:30pm". */
export function formatClock(hours: number, minutes: number): string {
	const suffix = hours >= 12 ? 'pm' : 'am'
	const h = hours % 12 || 12
	return minutes ? `${h}:${String(minutes).padStart(2, '0')}${suffix}` : `${h}${suffix}`
}

/** "2026-10-28" and "18:30" for an instant in a time zone: what date and time inputs hold. */
export function inputValuesIn(iso: string, timeZone: string): { date: string; time: string } {
	const p = Object.fromEntries(
		new Intl.DateTimeFormat('en-GB', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hourCycle: 'h23',
			timeZone
		})
			.formatToParts(new Date(iso))
			.map((x) => [x.type, x.value])
	)
	return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` }
}

/** "Wednesday 28 October" for an event, in its own time zone, for listing it. */
export function eventDayLabel(ev: CalendarEvent, now = new Date()): string {
	return formatDay(new Date(ev.startAt), validTimeZone(ev.timezone), now)
}

/**
 * PauseAI's events page, which lists every chapter's events: the readable link printed on event designs. A chapter's
 * designs print its own site instead (see eventsLink in chapters.ts).
 */
export const EVENTS_PAGE_URL = 'pauseai.info/events'

/** The event's own page. Luma's ids are random codes, so this goes in a QR code rather than being printed. */
export function eventLink(ev: CalendarEvent): string {
	// Luma usually gives the page's slug, but may give its whole address.
	return /^https?:\/\//i.test(ev.id) ? ev.id.replace(/^https?:\/\//i, '') : `lu.ma/${ev.id}`
}

/**
 * Field values for the Event layout, filled from a calendar event. Date and times are in the event's own zone.
 * The printed web address is the events page (PauseAI's, or the chapter's own site), since the event's own link is a code nobody can type.
 */
export function eventFieldValues(
	ev: CalendarEvent,
	eventsUrl = EVENTS_PAGE_URL
): Record<string, string> {
	const tz = validTimeZone(ev.timezone)
	const start = inputValuesIn(ev.startAt, tz)
	return {
		headline: ev.name.slice(0, 80),
		date: start.date,
		start: start.time,
		end: ev.endAt ? inputValuesIn(ev.endAt, tz).time : '',
		venue: ev.venue.slice(0, 60),
		// Luma's calendar has no descriptions, and the example one would describe a different event, so start empty.
		blurb: '',
		url: eventsUrl,
		group: (ev.city ?? '').slice(0, 24)
	}
}

export const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/
export const TIME_INPUT = /^\d{2}:\d{2}$/

/** "6:30pm – 8pm" from time input values, or just the start. Empty without a start. */
export function formatPickedTimeRange(start: string, end: string): string {
	const from = formatPickedTime(start)
	const to = formatPickedTime(end)
	return from && to ? `${from} – ${to}` : from
}

/** A date for the Event layout's example: the Thursday at least two weeks from `now`, as a date input holds it. */
export function exampleEventDate(now = new Date()): string {
	const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 14, 12))
	d.setUTCDate(d.getUTCDate() + ((4 - d.getUTCDay() + 7) % 7))
	return d.toISOString().slice(0, 10)
}

/** "Wednesday 28 October" from a date input's "YYYY-MM-DD". Empty when it cannot be read. */
export function formatPickedDate(ymd: string, now = new Date()): string {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
	if (!m) return ''
	// Noon UTC keeps the calendar day the same wherever the formatter's zone is.
	const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12))
	return formatDay(date, 'UTC', now)
}

/** "6:30pm" from a time input's "HH:MM". Empty when it cannot be read. */
export function formatPickedTime(hm: string): string {
	const m = /^(\d{2}):(\d{2})$/.exec(hm)
	return m ? formatClock(Number(m[1]), Number(m[2])) : ''
}
