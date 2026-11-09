import { get } from 'svelte/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('$app/environment', () => ({ browser: true, dev: false }))

// What a browser that blocks third-party site data does inside a cross-origin iframe.
const blockedStorage = () => {
	throw new DOMException('The operation is insecure.', 'SecurityError')
}

describe('with localStorage blocked', () => {
	beforeEach(() => {
		vi.resetModules()
		Object.defineProperty(globalThis, 'localStorage', { get: blockedStorage, configurable: true })
		vi.stubGlobal('document', { documentElement: { setAttribute: vi.fn() } })
	})

	afterEach(() => {
		Reflect.deleteProperty(globalThis, 'localStorage')
		vi.unstubAllGlobals()
	})

	it('loads the theme on the default and toggles it', async () => {
		const { userTheme, toggleTheme } = await import('./theme')
		expect(get(userTheme)).toBe('auto')
		expect(() => toggleTheme()).not.toThrow()
		expect(get(userTheme)).toBe('dark')
	})

	it('loads the widget consent on the default and sets it', async () => {
		const { default: consent } = await import('./components/widget-consent/WidgetConsentStore')
		expect(get(consent)).toBeNull()
		expect(() => consent.set(true)).not.toThrow()
	})
})
