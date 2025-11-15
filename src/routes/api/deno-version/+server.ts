/* eslint-disable @typescript-eslint/no-explicit-any */
import { json } from '@sveltejs/kit'

export const config = {
	runtime: 'edge'
}

// TypeScript doesn't know about Deno globals - these only exist at runtime in edge functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any

export const GET = async () => {
	// Test if we can modify window global
	const windowTests: any = {
		can_delete_window: false,
		can_set_window_undefined: false,
		can_add_window_location: false,
		can_modify_window_location: false
	}

	if (typeof window !== 'undefined') {
		// Test 1: Can we delete window?
		try {
			delete (globalThis as any).window
			windowTests.can_delete_window = typeof window === 'undefined'
			// Restore if deleted
			if (windowTests.can_delete_window) {
				;(globalThis as any).window = {}
			}
		} catch (e) {
			windowTests.delete_error = String(e)
		}

		// Test 2: Can we set window to undefined?
		try {
			const original = (globalThis as any).window
			;(globalThis as any).window = undefined
			windowTests.can_set_window_undefined = typeof window === 'undefined'
			;(globalThis as any).window = original
		} catch (e) {
			windowTests.set_undefined_error = String(e)
		}

		// Test 3: Can we add window.location?
		try {
			const hadLocation = typeof window.location !== 'undefined'
			if (!hadLocation) {
				;(window as any).location = { href: 'http://test.com' }
				windowTests.can_add_window_location = typeof window.location !== 'undefined'
				// Clean up
				if (windowTests.can_add_window_location) {
					delete (window as any).location
				}
			} else {
				windowTests.location_already_exists = true
			}
		} catch (e) {
			windowTests.add_location_error = String(e)
		}

		// Test 4: Can we modify existing window.location?
		try {
			const hadLocation = typeof window.location !== 'undefined'
			if (hadLocation) {
				const original = window.location
				;(window as any).location = undefined
				windowTests.can_modify_window_location = typeof window.location === 'undefined'
				;(window as any).location = original
			} else {
				windowTests.no_location_to_modify = true
			}
		} catch (e) {
			windowTests.modify_location_error = String(e)
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const info: Record<string, any> = {
		endpoint_version: 'v5-test-window-modification',
		timestamp: new Date().toISOString(),
		windowTests,
		deno_version: typeof Deno !== 'undefined' ? Deno.version : 'Deno not available',
		window_exists: typeof window !== 'undefined',
		window_location_exists: typeof window !== 'undefined' && typeof window.location !== 'undefined'
	}

	// Try to get more details if Deno is available
	if (typeof Deno !== 'undefined') {
		info.deno_details = {
			deno: Deno.version?.deno,
			v8: Deno.version?.v8,
			typescript: Deno.version?.typescript
		}
		// Try to get more info about Deno object
		info.deno_properties = Object.keys(Deno).slice(0, 30)
		info.deno_version_type = typeof Deno.version
		info.deno_version_stringify = JSON.stringify(Deno.version)
	}

	// Check window object properties safely
	if (typeof window !== 'undefined') {
		info.window_properties = Object.keys(window).slice(0, 20) // First 20 properties
		info.window_location_type = typeof window.location

		// Try to get navigator info if available
		if (typeof window.navigator !== 'undefined') {
			info.navigator = {
				userAgent: window.navigator.userAgent,
				platform: window.navigator.platform,
				appName: window.navigator.appName,
				appVersion: window.navigator.appVersion
			}
		}
	}

	// Try alternative ways to get version info
	if (typeof Deno !== 'undefined') {
		// Check if version is a getter
		const descriptor = Object.getOwnPropertyDescriptor(Deno, 'version')
		info.version_descriptor = descriptor
			? {
					configurable: descriptor.configurable,
					enumerable: descriptor.enumerable,
					has_get: !!descriptor.get,
					has_value: 'value' in descriptor
				}
			: 'no descriptor'
	}

	return json(info)
}
