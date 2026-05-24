import client from './client.js'
import type GetItems from './types/calendar/get-items.js'

export async function getItems(params: {
	calendarApiId: string
	period: 'future'
	paginationLimit: number
}): Promise<GetItems> {
	const res = await client.get<GetItems>('/calendar/get-items', { params })
	return res.data
}
