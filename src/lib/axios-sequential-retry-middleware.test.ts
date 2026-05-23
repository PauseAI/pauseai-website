import { afterEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import type { AxiosError } from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { AxiosSequentialRetryMiddleware } from './axios-sequential-retry-middleware.js'

function isRetryableError(error: unknown): error is AxiosError {
	return axios.isAxiosError(error) && error.response?.status === 429
}

describe('AxiosSequentialRetryMiddleware', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('retries retryable requests', async () => {
		vi.useFakeTimers()
		const client = axios.create()
		const mock = new MockAdapter(client)
		new AxiosSequentialRetryMiddleware({
			retries: 3,
			retryCondition: isRetryableError,
			retryDelay: () => 100
		}).applyTo(client)

		mock.onGet('/items').replyOnce(429)
		mock.onGet('/items').replyOnce(200, {
			items: []
		})

		const request = client.get('/items')
		await vi.runAllTimersAsync()

		await expect(request).resolves.toMatchObject({
			data: {
				items: []
			}
		})
		expect(mock.history.get).toHaveLength(2)
	})

	it('runs retry attempts sequentially', async () => {
		vi.useFakeTimers()
		const client = axios.create()
		const mock = new MockAdapter(client)
		new AxiosSequentialRetryMiddleware({
			retries: 3,
			retryCondition: isRetryableError,
			retryDelay: () => 100
		}).applyTo(client)

		let calls = 0
		let retriesStarted = 0
		let finishFirstRetry: () => void

		mock.onGet('/items').reply(() => {
			calls += 1

			if (calls <= 2) {
				return [429]
			}

			retriesStarted += 1
			if (retriesStarted === 1) {
				return new Promise((resolve) => {
					finishFirstRetry = () => resolve([200, { items: [] }])
				})
			}

			return [200, { items: [] }]
		})

		const firstRequest = client.get('/items')
		const secondRequest = client.get('/items')
		await vi.runOnlyPendingTimersAsync()

		expect(retriesStarted).toBe(1)

		finishFirstRetry!()
		await firstRequest
		await vi.runOnlyPendingTimersAsync()

		await expect(secondRequest).resolves.toMatchObject({
			data: {
				items: []
			}
		})
		expect(retriesStarted).toBe(2)
	})
})
