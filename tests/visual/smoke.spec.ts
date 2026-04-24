import { test } from '@chromatic-com/playwright'
import { ROUTES } from './routes'

// Cross-origin requests that can change independently of the page we're
// snapshotting get aborted: third-party iframes (Tally forms, Luma calendars)
// and cross-origin API calls (Mapbox tiles, widget fetches, analytics beacons).
// Iframes render as empty containers at their CSS-fixed size — layout stays
// stable; we don't diff into iframe content anyway. Server-side external
// calls are handled separately by MSW-node (see msw-setup.mjs).
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
