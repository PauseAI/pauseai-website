export async function GET({ url }) {
	const delay = url.searchParams.get('delay') || '1'
	const start = Date.now()

	try {
		const response = await fetch(`https://httpbin.org/delay/${delay}`)
		const elapsed = Date.now() - start

		return new Response(
			JSON.stringify({
				requestedDelay: delay,
				elapsedMs: elapsed,
				status: response.status
			}),
			{
				headers: { 'content-type': 'application/json' }
			}
		)
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : String(error),
				elapsedMs: Date.now() - start
			}),
			{
				headers: { 'content-type': 'application/json' }
			}
		)
	}
}
