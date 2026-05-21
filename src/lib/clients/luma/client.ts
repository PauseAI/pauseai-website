import axios from 'axios'
import axiosRetry from 'axios-retry'
import type { AxiosError } from 'axios'
import snakecaseKeys from 'snakecase-keys'

const BASE_URL = 'https://api.lu.ma/'
const RETRIES = 3

const client = axios.create({
	baseURL: BASE_URL
})

let retryQueue = Promise.resolve()

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableLumaError(error: unknown): error is AxiosError {
	return (
		axios.isAxiosError(error) &&
		(axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429)
	)
}

async function retryRequest<T>(request: () => Promise<T>, firstError: AxiosError): Promise<T> {
	let error = firstError

	for (let retryCount = 1; retryCount <= RETRIES; retryCount++) {
		await sleep(axiosRetry.exponentialDelay(retryCount, error))

		try {
			return await request()
		} catch (nextError) {
			if (!isRetryableLumaError(nextError)) {
				throw nextError
			}

			error = nextError
		}
	}

	throw error
}

function enqueueRetry<T>(request: () => Promise<T>, error: AxiosError): Promise<T> {
	const retryTask = retryQueue.then(() => retryRequest(request, error))
	retryQueue = retryTask.then(
		() => undefined,
		() => undefined
	)
	return retryTask
}

export async function requestWithSequentialRetries<T>(request: () => Promise<T>): Promise<T> {
	try {
		return await request()
	} catch (error) {
		if (!isRetryableLumaError(error)) {
			throw error
		}

		return enqueueRetry(request, error)
	}
}

client.interceptors.request.use((request) => {
	request.params = snakecaseKeys(request.params as Record<string, unknown>)
	return request
})

export default client
