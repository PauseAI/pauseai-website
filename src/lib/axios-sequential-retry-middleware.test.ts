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

	it('exhausts one failed request before retrying the next failed request', async () => {
		vi.useFakeTimers()
		const client = axios.create()
		const mock = new MockAdapter(client)
		new AxiosSequentialRetryMiddleware({
			retries: 3,
			retryCondition: isRetryableError,
			retryDelay: () => 100
		}).applyTo(client)

		const callsByRequest = new Map<string, number>()
		const requestSequence: string[] = []

		mock.onGet('/items').reply((config) => {
			const params = config.params as { id: string }
			const requestId = String(params.id)
			const callCount = (callsByRequest.get(requestId) ?? 0) + 1
			callsByRequest.set(requestId, callCount)
			requestSequence.push(`${requestId}:${callCount}`)

			return [429]
		})

		const requests = ['req1', 'req2', 'req3'].map((id) =>
			client.get('/items', { params: { id } }).catch(() => undefined)
		)

		await vi.runAllTimersAsync()
		await Promise.all(requests)

		expect(requestSequence).toEqual([
			'req1:1',
			'req2:1',
			'req3:1',
			'req1:2',
			'req1:3',
			'req1:4',
			'req2:2',
			'req2:3',
			'req2:4',
			'req3:2',
			'req3:3',
			'req3:4'
		])
	})
})
