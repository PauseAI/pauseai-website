import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const updated = vi.hoisted(() => ({ current: false, check: vi.fn() }))
const captureException = vi.hoisted(() => vi.fn())
const sentryInit = vi.hoisted(() => vi.fn())

vi.mock('$app/state', () => ({ updated }))
vi.mock('$env/static/public', () => ({ PUBLIC_SENTRY_DSN: 'https://key@o1.ingest.sentry.io/1' }))
vi.mock('@sentry/svelte', () => ({ init: sentryInit, captureException }))

const chunkError = () =>
	new TypeError(
		'Failed to fetch dynamically imported module: https://pauseai.info/_app/immutable/nodes/0.js'
	)

describe('handleError on a chunk-load error from a replaced deploy', () => {
	let store: Map<string, string>
	let reload: ReturnType<typeof vi.fn>

	beforeEach(() => {
		vi.resetModules()
		updated.current = false
		updated.check.mockResolvedValue(true)
		captureException.mockClear()
		store = new Map()
		reload = vi.fn()
		vi.stubGlobal('sessionStorage', {
			getItem: (key: string) => store.get(key) ?? null,
			setItem: (key: string, value: string) => store.set(key, value)
		})
		vi.stubGlobal('location', { pathname: '/communities', search: '', reload })
	})

	afterEach(() => vi.unstubAllGlobals())

	const handle = async (href: string, error: unknown = chunkError()) => {
		const hooks = await import('./hooks.client')
		hooks.init()
		const event = { url: new URL(href), params: {}, route: { id: null } }
		return hooks.handleError({ error, event, status: 500, message: 'Internal Error' })
	}

	it('reloads a page whose hydration failed, without reporting', async () => {
		await handle('https://pauseai.info/communities#top')
		expect(reload).toHaveBeenCalledTimes(1)
		expect(captureException).not.toHaveBeenCalled()
	})

	it('reports instead of reloading again when the guard refuses', async () => {
		store.set('stale-build-reload', String(Date.now()))
		await handle('https://pauseai.info/communities')
		expect(reload).not.toHaveBeenCalled()
		expect(captureException).toHaveBeenCalledTimes(1)
	})

	it('neither reloads nor reports a failed link preload', async () => {
		await handle('https://pauseai.info/faq')
		expect(reload).not.toHaveBeenCalled()
		expect(captureException).not.toHaveBeenCalled()
	})

	it('reports a chunk-load error on the current deploy', async () => {
		updated.check.mockResolvedValue(false)
		await handle('https://pauseai.info/communities')
		expect(reload).not.toHaveBeenCalled()
		expect(captureException).toHaveBeenCalledTimes(1)
	})
})

describe('?sentry=off on an embed', () => {
	beforeEach(() => {
		vi.resetModules()
		sentryInit.mockClear()
		captureException.mockClear()
		updated.check.mockResolvedValue(false)
	})

	afterEach(() => vi.unstubAllGlobals())

	const load = async (pathname: string, search: string) => {
		vi.stubGlobal('location', { pathname, search, reload: vi.fn() })
		const hooks = await import('./hooks.client')
		hooks.init()
		await hooks.handleError({
			error: new Error('boom'),
			event: {
				url: new URL(pathname + search, 'https://pauseai.info'),
				params: {},
				route: { id: null }
			},
			status: 500,
			message: 'Internal Error'
		})
	}

	it('skips Sentry entirely, including error reports', async () => {
		await load('/embed/onboarding-form', '?locale=de&country=Switzerland&sentry=off')
		expect(sentryInit).not.toHaveBeenCalled()
		expect(captureException).not.toHaveBeenCalled()
	})

	it('keeps Sentry on embeds by default', async () => {
		await load('/embed/onboarding-form', '?locale=de&country=Switzerland')
		expect(sentryInit).toHaveBeenCalledTimes(1)
		expect(captureException).toHaveBeenCalledTimes(1)
	})

	it('is ignored outside /embed/', async () => {
		await load('/join', '?sentry=off')
		expect(sentryInit).toHaveBeenCalledTimes(1)
	})
})
