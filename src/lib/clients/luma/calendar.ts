import client from './client.js'
import type GetItems from './types/calendar/get-items.js'

/** PauseAI's own (global) Luma calendar. National chapters' calendars are in national-chapters.json. */
export const GLOBAL_CALENDAR_ID = 'cal-E1qhLPs5IvlQr8S'

export async function getItems(params: {
	calendarApiId: string
	period: 'future'
	paginationLimit: number
}): Promise<GetItems> {
	const res = await client.get<GetItems>('/calendar/get-items', { params })
	return res.data
}
