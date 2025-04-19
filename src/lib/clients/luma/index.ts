import axios from 'axios'
import snakecaseKeys from 'snakecase-keys'
import type GetItems from './types/calendar/get-items.js'

const BASE_URL = 'https://api.lu.ma/'

const client = axios.create({
	baseURL: BASE_URL
})
client.interceptors.request.use((request) => {
	request.params = snakecaseKeys(request.params)
	return request
})

export const Calendar = {
	async getItems(params: {
		calendarApiId: string
		period: 'future'
		paginationLimit: number
	}): Promise<GetItems> {
		const res = await client.get<GetItems>('/calendar/get-items', { params })
		return res.data
	}
}
