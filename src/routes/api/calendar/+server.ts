import * as luma from '$lib/clients/luma'

export const prerender = false

const CALENDAR_ID = 'cal-E1qhLPs5IvlQr8S'

export async function GET({ setHeaders }) {
	const items = await luma.Calendar.getItems({
		calendarApiId: CALENDAR_ID,
		period: 'future',
		paginationLimit: 20
	})
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})
	return new Response(JSON.stringify(items))
}
