import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request }) => {
	console.log('[test-edge-crash] About to trigger edge function process crash...')

	// Try multiple approaches to kill the process
	const method = new URL(request.url).searchParams.get('method') || '1'

	switch (method) {
		case '1':
			// Method 1: Infinite recursion (stack overflow)
			console.log('Attempting stack overflow...')
			function recurse(): any {
				return recurse()
			}
			return recurse()

		case '3':
			// Method 3: Process.exit() if available
			console.log('Attempting process.exit...')
			if (typeof process !== 'undefined' && process.exit) {
				process.exit(1)
			}
			throw new Error('process.exit not available')

		case '4':
			// Method 4: Deno.exit() if available
			console.log('Attempting Deno.exit...')
			if (typeof Deno !== 'undefined' && Deno.exit) {
				Deno.exit(1)
			}
			throw new Error('Deno.exit not available')

		default:
			throw new Error('Invalid crash method')
	}
}
