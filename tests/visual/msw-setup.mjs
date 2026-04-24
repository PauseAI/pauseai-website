// MSW-node bootstrap for visual-diff runs. Loaded via NODE_OPTIONS=--import
// from the visual-diff GitHub Actions step. No-op in normal dev/build.
//
// Ensures Airtable / Notion / Substack requests made during `pnpm build`
// (prerender, remote prerender fns) and `pnpm preview` (on-demand SSR)
// return pinned fixtures instead of hitting live APIs, so snapshots are
// deterministic and the build doesn't need production secrets.
//
// If MSW_WARN_LOG is set, also append a line for each unhandled request
// (no handler matched — MSW bypasses through to the real network). The
// scope-comment script reads this file to surface un-fixtured endpoints
// in the PR comment so a new un-mocked integration doesn't silently pass.

if (process.env.VISUAL_TEST === '1') {
	const { setupServer } = await import('msw/node')
	const { handlers } = await import('./msw-handlers.ts')
	const server = setupServer(...handlers)

	const warnLog = process.env.MSW_WARN_LOG
	if (warnLog) {
		const { appendFileSync } = await import('node:fs')
		server.events.on('request:unhandled', ({ request }) => {
			// Filter same-origin preview-server calls (the Node process making a
			// fetch back to localhost:4173 for /api/posts etc.). These aren't
			// un-fixtured external integrations.
			if (request.url.startsWith('http://localhost:')) return
			appendFileSync(warnLog, `UNHANDLED ${request.method} ${request.url}\n`)
		})
	}

	server.listen({ onUnhandledRequest: 'bypass' })
}
