import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

interface SequentialRetryConfig extends AxiosRequestConfig {
	skipSequentialRetries?: boolean
}

export interface SequentialRetryMiddlewareOptions {
	retries: number
	retryCondition: (error: unknown) => error is AxiosError
	retryDelay: (retryCount: number, error: AxiosError) => number
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export class AxiosSequentialRetryMiddleware {
	private queue = Promise.resolve()

	constructor(private readonly options: SequentialRetryMiddlewareOptions) {}

	applyTo(client: AxiosInstance): void {
		client.interceptors.response.use(undefined, (error: unknown) => this.handleError(client, error))
	}

	private async handleError(client: AxiosInstance, error: unknown): Promise<unknown> {
		if (!this.options.retryCondition(error) || !error.config) {
			throw error
		}

		const config = error.config as SequentialRetryConfig
		if (config.skipSequentialRetries) {
			throw error
		}

		return this.enqueueRetry(() => this.retryRequest(client, config, error))
	}

	private async retryRequest(
		client: AxiosInstance,
		config: SequentialRetryConfig,
		firstError: AxiosError
	): Promise<unknown> {
		let error = firstError

		for (let retryCount = 1; retryCount <= this.options.retries; retryCount++) {
			await sleep(this.options.retryDelay(retryCount, error))

			try {
				const retryConfig: SequentialRetryConfig = {
					...config,
					skipSequentialRetries: true
				}
				return await client.request(retryConfig)
			} catch (nextError) {
				if (!this.options.retryCondition(nextError)) {
					throw nextError
				}

				error = nextError
			}
		}

		throw error
	}

	private enqueueRetry<T>(request: () => Promise<T>): Promise<T> {
		const retryTask = this.queue.then(request)
		this.queue = retryTask.then(
			() => undefined,
			() => undefined
		)
		return retryTask
	}
}
