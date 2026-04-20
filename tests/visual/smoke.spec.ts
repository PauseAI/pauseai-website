import { test } from '@chromatic-com/playwright'
import { ROUTES } from './routes'

test.describe('routes', () => {
	test.beforeEach(async ({ page }) => {
		// All fixture data is served upstream by MSW-node (see msw/setup.mjs);
		// the routes here are only used to *abort* third-party widget requests
		// whose rendering would otherwise churn the snapshots.

		// Block Tally form embeds (used on /statement and /join). Tally's iframe
		// reports its content height back to the parent async, producing ~20px
		// height deltas between runs. With the iframe blocked, the container
		// collapses to its CSS size — deterministic. We lose no coverage: the
		// iframe content isn't visible to Chromatic anyway.
		await page.route('**/tally.so/**', (route) => route.abort())
		// Block Mapbox tiles/styles (used on /communities). Map tiles churn and
		// are canvas-rendered, so Chromatic sees a blank canvas either way —
		// aborting is deterministic. The .map-wrap container stays at its CSS
		// size (padding-bottom 56.25%), so the surrounding layout still diffs.
		await page.route('**/api.mapbox.com/**', (route) => route.abort())
		// Block Luma iframe embeds (calendar on /communities, checkout button
		// elsewhere). Iframes have fixed CSS height attrs, so aborting keeps
		// the layout stable; Chromatic can't see iframe internals anyway.
		await page.route('**/lu.ma/**', (route) => route.abort())
	})

	for (const path of ROUTES) {
		const name = path === '/' ? 'home' : path.slice(1).replace(/\//g, '-')
		test(name, async ({ page }, testInfo) => {
			const response = await page.goto(path, { waitUntil: 'networkidle' })
			if (!response || !response.ok()) {
				throw new Error(`${path} returned ${response?.status() ?? 'no response'}`)
			}
			await page.evaluate(() => document.fonts.ready)
			// Force lazy-loaded images to fetch eagerly before the full-page
			// screenshot. Playwright's fullPage capture scrolls the page, but the
			// lazy-load trigger timing isn't reliably in sync with the screenshot
			// frame — some images finish, others don't, and the diff flakes.
			await page.evaluate(() => {
				for (const img of document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')) {
					img.loading = 'eager'
				}
			})
			await page.waitForLoadState('networkidle')
			// Self-validate the MSW Substack mock is actually being used — otherwise
			// the suite would quietly capture live feed data. The homepage renders
			// news items whose titles come from msw/fixtures/substack-feed.xml.
			if (path === '/') {
				await page
					.getByText('Fixture Substack post one')
					.waitFor({ state: 'visible', timeout: 5000 })
			}
			const screenshot = await page.screenshot({ fullPage: true })
			await testInfo.attach('full-page', { body: screenshot, contentType: 'image/png' })
		})
	}
})
