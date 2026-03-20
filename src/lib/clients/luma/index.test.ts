import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('luma client', () => {
	it('sends a request with snake_cased URL parameters to api.lu.ma', async () => {
		const originalCreate = axios.create
		let mock: MockAdapter
		vi.spyOn(axios, 'create').mockImplementation((...args) => {
			const axios = originalCreate(...args)
			mock = new MockAdapter(axios)
			return axios
		})

		const luma = await import('.')

		mock!.onGet('https://api.lu.ma/calendar/get-items').reply(200)

		await luma.Calendar.getItems({
			calendarApiId: 'abc-123',
			period: 'future',
			paginationLimit: 20
		})

		const request = mock!.history.get[0]
		expect(request.url).toBe('/calendar/get-items')
		expect(request.params).toEqual({
			calendar_api_id: 'abc-123',
			period: 'future',
			pagination_limit: 20
		})
	})
})
