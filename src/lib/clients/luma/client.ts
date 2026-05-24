import axios from 'axios'
import axiosRetry from 'axios-retry'
import type { AxiosError } from 'axios'
import snakecaseKeys from 'snakecase-keys'
import { AxiosSequentialRetryMiddleware } from '$lib/axios-sequential-retry-middleware.js'

const BASE_URL = 'https://api.lu.ma/'
const RETRIES = 3

const client = axios.create({
	baseURL: BASE_URL
})

function isRetryableLumaError(error: unknown): error is AxiosError {
	return (
		axios.isAxiosError(error) &&
		(axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429)
	)
}

client.interceptors.request.use((request) => {
	request.params = snakecaseKeys(request.params as Record<string, unknown>)
	return request
})
new AxiosSequentialRetryMiddleware({
	retries: RETRIES,
	retryCondition: isRetryableLumaError,
	retryDelay: (...args) => axiosRetry.exponentialDelay(...args)
}).applyTo(client)

export default client
