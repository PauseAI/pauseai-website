import { json } from '@sveltejs/kit'

export const config = {
	runtime: 'edge'
}

export const GET = async () => {
	const info: Record<string, any> = {
		timestamp: new Date().toISOString(),
		deno_version: typeof Deno !== 'undefined' ? Deno.version : 'Deno not available',
		window_exists: typeof window !== 'undefined',
		window_location_exists: typeof window !== 'undefined' && typeof window.location !== 'undefined'
	}

	// Try to get more details if Deno is available
	if (typeof Deno !== 'undefined' && Deno.version) {
		info.deno_details = {
			deno: Deno.version.deno,
			v8: Deno.version.v8,
			typescript: Deno.version.typescript
		}
	}

	// Check window object properties safely
	if (typeof window !== 'undefined') {
		info.window_properties = Object.keys(window).slice(0, 20) // First 20 properties
		info.window_location_type = typeof window.location
	}

	return json(info)
}
