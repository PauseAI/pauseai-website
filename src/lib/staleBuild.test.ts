import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('$app/state', () => ({ updated: { current: false, check: vi.fn() } }))

describe('isChunkLoadError', async () => {
	const { isChunkLoadError } = await import('./staleBuild')

	it.each([
		new TypeError(
			'Failed to fetch dynamically imported module: https://pauseai.info/_app/immutable/chunks/a.js'
		),
		new TypeError('Importing a module script failed.'),
		new TypeError(
			'error loading dynamically imported module: https://pauseai.info/_app/immutable/nodes/0.js'
		),
		new Error('Unable to preload CSS for https://pauseai.info/_app/immutable/assets/1.css')
	])('matches $message', (error) => {
		expect(isChunkLoadError(error)).toBe(true)
	})

	it('does not match an unrelated error or a non-Error', () => {
		expect(isChunkLoadError(new TypeError('Failed to fetch'))).toBe(false)
		expect(isChunkLoadError('Importing a module script failed.')).toBe(false)
		expect(isChunkLoadError(undefined)).toBe(false)
	})
})

describe('reloadOnce', () => {
	let store: Map<string, string>
	let reload: ReturnType<typeof vi.fn>

	beforeEach(() => {
		vi.resetModules()
		vi.useFakeTimers()
		store = new Map()
		reload = vi.fn()
		vi.stubGlobal('sessionStorage', {
			getItem: (key: string) => store.get(key) ?? null,
			setItem: (key: string, value: string) => store.set(key, value)
		})
		vi.stubGlobal('location', { reload })
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

	// A fresh module per page load, sharing the tab's sessionStorage.
	const loadPage = async () => (await import('./staleBuild')).reloadOnce

	it('reloads, then refuses a second reload within 30 seconds', async () => {
		expect((await loadPage())()).toBe(true)
		vi.resetModules()
		vi.advanceTimersByTime(29_000)
		expect((await loadPage())()).toBe(false)
		expect(reload).toHaveBeenCalledTimes(1)
	})

	it('reloads again once 30 seconds have passed', async () => {
		expect((await loadPage())()).toBe(true)
		vi.resetModules()
		vi.advanceTimersByTime(30_000)
		expect((await loadPage())()).toBe(true)
		expect(reload).toHaveBeenCalledTimes(2)
	})

	it('refuses when storage throws', async () => {
		vi.stubGlobal('sessionStorage', {
			getItem: () => {
				throw new DOMException('The operation is insecure.', 'SecurityError')
			}
		})
		expect((await loadPage())()).toBe(false)
		expect(reload).not.toHaveBeenCalled()
	})
})

describe('fullLoadTarget', async () => {
	const { fullLoadTarget } = await import('./staleBuild')
	const target = (href: string) => ({
		url: new URL(href),
		params: {},
		route: { id: null }
	})
	const nav = (type: string, to = 'https://pauseai.info/faq', from = 'https://pauseai.info/') =>
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the fields fullLoadTarget reads
		({ type, willUnload: false, from: target(from), to: target(to) }) as any

	it('sends back and forward to a full load', () => {
		expect(fullLoadTarget(nav('popstate'), true)?.href).toBe('https://pauseai.info/faq')
	})

	it.each(['link', 'form'])('leaves a %s navigation to the reload option', (type) => {
		expect(fullLoadTarget(nav(type), true)).toBeNull()
	})

	it('leaves goto to the router, so its state and replaceState survive', () => {
		expect(fullLoadTarget(nav('goto'), true)).toBeNull()
	})

	it('leaves a back or forward between hash entries of one page alone', () => {
		expect(fullLoadTarget(nav('popstate', 'https://pauseai.info/#faq'), true)).toBeNull()
	})

	it('does nothing before a newer deploy is live', () => {
		expect(fullLoadTarget(nav('popstate'), false)).toBeNull()
	})
})
