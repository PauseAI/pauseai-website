import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

vi.mock('$env/dynamic/public', () => ({ env: {} }))
vi.mock('$lib/paraglide/server.js', () => ({
	paraglideMiddleware: (
		request: Request,
		resolve: (args: { request: Request; locale: string }) => unknown
	) => resolve({ request, locale: 'de' })
}))
vi.mock('$lib/paraglide/runtime', () => ({
	deLocalizeUrl: (url: URL) => new URL(url.pathname.replace(/^\/(de|it|nl)(?=\/|$)/, ''), url)
}))

const { handle } = await import('./hooks.server')

const appHtml = readFileSync(new URL('./app.html', import.meta.url), 'utf8')

// Run the handle hook for a URL path and return the page app.html becomes.
async function render(path: string, routeId: string | null = path) {
	let out = ''
	const event = {
		request: new Request(new URL(path, 'https://pauseai.info')),
		url: new URL(path, 'https://pauseai.info'),
		route: { id: routeId }
	}
	await handle({
		event: event as never,
		resolve: ((
			_event: unknown,
			opts?: { transformPageChunk?: (input: { html: string; done: boolean }) => string }
		) => {
			out = opts?.transformPageChunk?.({ html: appHtml, done: true }) ?? appHtml
			return Promise.resolve(new Response(out))
		}) as never
	})
	return out
}

describe('Google Tag Manager', () => {
	it('app.html loads GTM (otherwise the checks below prove nothing)', () => {
		expect(appHtml).toContain('googletagmanager.com/gtm.js')
		expect(appHtml).toContain('googletagmanager.com/ns.html')
	})

	it('is left on ordinary pages', async () => {
		for (const [path, id] of [
			['/', '/'],
			['/join', '/join'],
			['/de/join', '/join'],
			['/no-such-page', null],
			['/embedded', '/[slug]']
		] as const) {
			const html = await render(path, id)
			expect(html).toContain('googletagmanager.com/gtm.js')
			expect(html).toContain('googletagmanager.com/ns.html')
		}
	})

	it('is removed from embed pages, leaving the rest of the page', async () => {
		for (const [path, id] of [
			['/embed/onboarding-form?locale=de&country=Switzerland', '/embed/onboarding-form'],
			['/embed/statement-form', '/embed/statement-form'],
			['/de/embed/onboarding-form', '/embed/onboarding-form'],
			// A mistyped or retired embed URL renders the 404 page inside the iframe.
			['/embed/onboarding-from', null]
		] as const) {
			const html = await render(path, id)
			expect(html).not.toMatch(/googletagmanager|dataLayer|Google Tag Manager/)
			expect(html).toContain('<html lang="de">')
			expect(html).toContain('%sveltekit.head%')
			expect(html).toContain('%sveltekit.body%')
		}
	})
})
