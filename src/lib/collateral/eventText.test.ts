import { describe, expect, it } from 'vitest'
import {
	eventFieldValues,
	formatClock,
	formatDay,
	formatPickedDate,
	formatPickedTime,
	formatPickedTimeRange,
	exampleEventDate,
	inputValuesIn,
	toCalendarEvents,
	type CalendarEvent
} from './eventText'

const now = new Date('2026-09-23T12:00:00Z')

describe('formatClock', () => {
	it('drops :00 and uses am/pm', () => {
		expect(formatClock(19, 0)).toBe('7pm')
		expect(formatClock(18, 30)).toBe('6:30pm')
		expect(formatClock(0, 5)).toBe('12:05am')
		expect(formatClock(12, 0)).toBe('12pm')
	})
})

describe('formatDay', () => {
	it('leaves out the year when it is this year', () => {
		expect(formatDay(new Date('2026-10-28T18:30:00Z'), 'Europe/London', now)).toBe(
			'Wednesday 28 October'
		)
	})

	it('adds the year when it is not this year', () => {
		expect(formatDay(new Date('2027-01-06T18:30:00Z'), 'Europe/London', now)).toBe(
			'Wednesday 6 January 2027'
		)
	})

	it("uses the event's time zone for the calendar day", () => {
		// 23:30 UTC on the 28th is already the 29th in London during BST.
		expect(formatDay(new Date('2026-09-28T23:30:00Z'), 'Europe/London', now)).toBe(
			'Tuesday 29 September'
		)
	})
})

describe('inputValuesIn', () => {
	it("gives date and time input values in the event's zone", () => {
		// 23:30 UTC on the 28th is 00:30 on the 29th in London during BST.
		expect(inputValuesIn('2026-09-28T23:30:00Z', 'Europe/London')).toEqual({
			date: '2026-09-29',
			time: '00:30'
		})
	})
})

describe('formatPickedTimeRange', () => {
	it('formats a start and end, or just the start', () => {
		expect(formatPickedTimeRange('18:30', '20:00')).toBe('6:30pm – 8pm')
		expect(formatPickedTimeRange('19:00', '')).toBe('7pm')
		expect(formatPickedTimeRange('', '20:00')).toBe('')
	})
})

describe('exampleEventDate', () => {
	it('is a Thursday at least two weeks away', () => {
		const date = exampleEventDate(now)
		expect(new Date(`${date}T12:00:00Z`).getUTCDay()).toBe(4)
		expect(date >= '2026-10-07').toBe(true)
		expect(date).toBe('2026-10-08')
	})
})

describe('eventFieldValues', () => {
	const ev: CalendarEvent = {
		id: 'abc123',
		name: 'Public meeting in Bristol',
		startAt: '2026-10-28T17:30:00Z',
		endAt: '2026-10-28T19:30:00Z',
		timezone: 'Europe/London',
		venue: 'The Station, Bristol',
		city: 'Bristol'
	}

	it("fills the Event layout fields, with the date and times in the event's zone", () => {
		expect(eventFieldValues(ev)).toEqual({
			headline: 'Public meeting in Bristol',
			date: '2026-10-28',
			start: '17:30',
			end: '19:30',
			venue: 'The Station, Bristol',
			blurb: '',
			url: 'pauseai.info/events',
			group: 'Bristol'
		})
	})

	it('falls back to UTC when the zone is unknown', () => {
		expect(eventFieldValues({ ...ev, timezone: 'Not/AZone' }).start).toBe('17:30')
	})

	it('trims to the field limits', () => {
		const long = eventFieldValues({ ...ev, name: 'x'.repeat(200), venue: 'y'.repeat(200) })
		expect(long.headline).toHaveLength(80)
		expect(long.venue).toHaveLength(60)
	})
})

describe('toCalendarEvents', () => {
	it('builds a venue from the address and city, and marks events without one as online', () => {
		const events = toCalendarEvents([
			{
				url: 'a',
				name: 'Pub',
				start_at: '2026-10-01T18:00:00Z',
				geo_address_info: { address: 'Cittie of Yorke', city: 'London' }
			},
			{ url: 'b', name: 'Call', start_at: '2026-10-02T18:00:00Z' },
			{
				url: 'c',
				name: 'Same',
				start_at: '2026-10-03T18:00:00Z',
				geo_address_info: { address: 'London', city: 'London' }
			},
			{ url: 'd', name: 'Guests only', start_at: '2026-10-04T18:00:00Z', geo_address_info: {} }
		])
		expect(events.map((e) => e.venue)).toEqual(['Cittie of Yorke, London', 'Online', 'London', ''])
		expect(events[1].city).toBeUndefined()
	})
})

describe('date and time pickers', () => {
	it('formats a picked date without shifting the day', () => {
		expect(formatPickedDate('2026-10-28', now)).toBe('Wednesday 28 October')
		expect(formatPickedDate('', now)).toBe('')
	})

	it('formats a picked time', () => {
		expect(formatPickedTime('18:30')).toBe('6:30pm')
		expect(formatPickedTime('nope')).toBe('')
	})
})
