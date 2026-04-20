import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: 'tests/visual',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: 'http://localhost:4173',
		// Pin locale and timezone so any date / number formatting that depends
		// on the browser context renders the same on every run.
		locale: 'en-US',
		timezoneId: 'UTC',
		// Opts into the site's `@media (prefers-reduced-motion: reduce)` block
		// (src/styles/reset.css), which zeros out animation and transition
		// durations. Keeps snapshots from capturing mid-animation state without
		// needing a custom style-injection in tests.
		contextOptions: { reducedMotion: 'reduce' }
	},
	projects: [
		{
			name: 'desktop',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }
		},
		{
			name: 'mobile',
			use: { ...devices['Pixel 7'], viewport: { width: 412, height: 839 } }
		}
	],
	webServer: {
		command: 'pnpm build && pnpm preview',
		port: 4173,
		timeout: 360_000,
		reuseExistingServer: !process.env.CI
	}
})
