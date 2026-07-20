// Visual-diff test entry point — navigates Playwright through every route
// in `routes.ts` and attaches a fullPage screenshot per route for Chromatic
// to diff. `@chromatic-com/playwright` captures HTML + assets per test; CI
// uploads those to Chromatic, which re-renders and diffs server-side.
// Cross-origin stability rules are applied in `beforeEach` — see the
// comment at `ABORTED_RESOURCE_TYPES`.

import { test } from '@chromatic-com/playwright'
import { ROUTES } from './routes'

// Cross-origin requests that can change independently of the page we're
// snapshotting get aborted: third-party iframes (Tally forms, Luma calendars)
// and cross-origin API calls (Mapbox tiles, widget fetches, analytics beacons).
// Iframes render as empty containers at their CSS-fixed size — layout stays
// stable; we don't diff into iframe content anyway. Server-side external
// calls are handled separately by MSW-node (see msw-setup.ts).
//
// Cross-origin *resources* — images (Cloudinary), fonts, scripts (inlang
// CDN), stylesheets — pass through. They're assets the page chose to embed
// and whose content is part of the rendered design we want to capture.
const ABORTED_RESOURCE_TYPES = new Set(['document', 'xhr', 'fetch'])

test.describe('routes', () => {
	test.beforeEach(async ({ page, baseURL }) => {
		if (!baseURL) throw new Error('baseURL is not configured in playwright.config.ts')
		const sameOrigin = new URL(baseURL).origin
		await page.route('**/*', (route, request) => {
			const url = new URL(request.url())
			if (url.origin === sameOrigin) return route.continue()
			if (ABORTED_RESOURCE_TYPES.has(request.resourceType())) return route.abort()
			return route.continue()
		})
	})

	for (const path of ROUTES) {
		const name = path === '/' ? 'home' : path.slice(1).replace(/\//g, '-')
		test(name, async ({ page }, testInfo) => {
			const response = await page.goto(path, { waitUntil: 'networkidle' })
			if (!response || !response.ok()) {
				throw new Error(`${path} returned ${response?.status() ?? 'no response'}`)
			}
			// Upgrade lazy images *before* waiting on fonts, so their new network
			// requests race against font loads instead of starting serially after.
			// Playwright's fullPage capture scrolls the page, but the native
			// lazy-load trigger isn't reliably in sync with the screenshot frame
			// — upgrading to eager makes loading deterministic.
			await page.evaluate(() => {
				for (const img of document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')) {
					img.loading = 'eager'
				}
			})
			await Promise.all([
				page.evaluate(() => document.fonts.ready),
				page.waitForLoadState('networkidle')
			])
			// Self-validate the MSW Substack mock is actually being used — otherwise
			// the suite would quietly capture live feed data. /api/news merges the
			// fixture Substack items with dated internal `news:` posts and sorts by
			// date, so a fixture post drops to a later page as newer internal posts
			// accrue (it no longer reliably lands on the rendered first page). Page
			// through the API instead, so this check doesn't silently rot as content
			// grows — it asserts the fixture is reachable, not where it sorts.
			if (path === '/') {
				let found = false
				// A for-loop (condition checked before the first body) rather than a
				// do-while, so the `found` / `totalPages` initialisers are read before
				// being reassigned — otherwise eslint's no-useless-assignment fires.
				for (let pageNum = 1, totalPages = 1; !found && pageNum <= totalPages; pageNum++) {
					// Fetch from inside the page (same-origin, so beforeEach's route
					// handler lets it through) rather than via page.request, whose
					// separate context isn't covered by page.route.
					const body = await page.evaluate(async (p) => {
						const res = await fetch(`/api/news?page=${p}&pageSize=12`)
						if (!res.ok) throw new Error(`/api/news returned ${res.status}`)
						return (await res.json()) as { items?: Array<{ title?: string }>; totalPages?: number }
					}, pageNum)
					totalPages = body.totalPages ?? 0
					found = (body.items ?? []).some((item) => item.title?.startsWith('Fixture Substack post'))
				}
				if (!found) {
					throw new Error(
						'Fixture Substack post not found in /api/news — the MSW handler is broken or the live feed leaked into the run'
					)
				}
			}
			const screenshot = await page.screenshot({ fullPage: true })
			await testInfo.attach('full-page', { body: screenshot, contentType: 'image/png' })
		})
	}
})
