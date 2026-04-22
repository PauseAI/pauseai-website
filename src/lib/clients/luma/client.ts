import axios from 'axios'
import snakecaseKeys from 'snakecase-keys'

const BASE_URL = 'https://api.lu.ma/'

const client = axios.create({
	baseURL: BASE_URL
})

client.interceptors.request.use((request) => {
	request.params = snakecaseKeys(request.params)
	return request
})

export default client
