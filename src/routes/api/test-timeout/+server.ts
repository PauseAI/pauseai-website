export async function GET({ url }) {
	const count = parseInt(url.searchParams.get('count') || '4')
	const delay = parseInt(url.searchParams.get('delay') || '10')
	const start = Date.now()
	const results = []

	console.log(`Starting ${count} sequential requests with ${delay}s delay each`)

	for (let i = 0; i < count; i++) {
		const reqStart = Date.now()
		try {
			const response = await fetch(`https://httpbin.org/delay/${delay}`)
			const data = await response.json()
			results.push({
				index: i,
				success: true,
				elapsed: Date.now() - reqStart,
				status: response.status
			})
		} catch (error) {
			results.push({
				index: i,
				success: false,
				elapsed: Date.now() - reqStart,
				error: error instanceof Error ? error.message : String(error)
			})
			break // Stop on first error
		}
	}

	const totalElapsed = Date.now() - start

	return new Response(
		JSON.stringify(
			{
				requestedTotal: count * delay,
				actualTotal: Math.round(totalElapsed / 1000),
				totalElapsedMs: totalElapsed,
				results
			},
			null,
			2
		),
		{
			headers: { 'content-type': 'application/json' }
		}
	)
}
