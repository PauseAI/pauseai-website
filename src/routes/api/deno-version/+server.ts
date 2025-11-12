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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const info: Record<string, any> = {
		endpoint_version: 'v3-deep-inspection',
		timestamp: new Date().toISOString(),
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
