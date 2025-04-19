import { describe, it, expect } from 'vitest'

import * as luma from '.'

const AZUKI_CALENDAR_ID = 'cal-kLFnev8X6JsxPOK'

describe('Calendar.getItems', () => {
	it('returns events with a name', async () => {
		const items = await luma.Calendar.getItems({
			calendarApiId: AZUKI_CALENDAR_ID,
			period: 'future',
			paginationLimit: 20
		})
		expect(items.entries[0].event.name).toBeTruthy()
	})
})
