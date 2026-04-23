import { test } from '@chromatic-com/playwright'
import { ROUTES } from './routes'

// Third-party widget domains to block entirely. Fixture data is served
// upstream by MSW-node (see msw-setup.mjs); these glob patterns live here
// because the requests originate cross-origin in the browser and never
// reach our Node process, so MSW-node can't see them.
//
// Blocking these keeps snapshots stable:
// - tally.so (on /statement and /join): iframe reports async content height,
//   producing ~20px deltas run-to-run.
// - api.mapbox.com (on /communities): churny canvas-rendered tiles.
// - lu.ma: iframe calendar / checkout button embeds.
//
// Each container has a fixed CSS size (explicit height or padding-bottom
// aspect-ratio), so the surrounding layout stays stable.
const ABORTED_HOSTS = ['**/tally.so/**', '**/api.mapbox.com/**', '**/lu.ma/**']

test.describe('routes', () => {
	test.beforeEach(async ({ page }) => {
		await Promise.all(ABORTED_HOSTS.map((pattern) => page.route(pattern, (route) => route.abort())))
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
			// the suite would quietly capture live feed data. The homepage renders
			// news items whose titles come from fixtures/substack-feed.xml.
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
