// MSW-node bootstrap for visual-diff runs. Loaded via NODE_OPTIONS=--import
// from the visual-diff GitHub Actions step. No-op in normal dev/build.
//
// Ensures Airtable / Notion / Substack requests made during `pnpm build`
// (prerender, remote prerender fns) and `pnpm preview` (on-demand SSR)
// return pinned fixtures instead of hitting live APIs, so snapshots are
// deterministic and the build doesn't need production secrets.

if (process.env.VISUAL_TEST === '1') {
	const { setupServer } = await import('msw/node')
	const { handlers } = await import('./msw-handlers.ts')
	const server = setupServer(...handlers)
	server.listen({ onUnhandledRequest: 'bypass' })
}
