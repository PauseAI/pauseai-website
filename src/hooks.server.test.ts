import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

vi.mock('$env/dynamic/public', () => ({ env: {} }))
vi.mock('$lib/paraglide/server.js', () => ({
	paraglideMiddleware: (
		request: Request,
		resolve: (args: { request: Request; locale: string }) => unknown
	) => resolve({ request, locale: 'de' })
}))

const { handle } = await import('./hooks.server')

const appHtml = readFileSync(new URL('./app.html', import.meta.url), 'utf8')

// Run the handle hook for a route and return the page app.html becomes.
async function render(routeId: string | null) {
	let out = ''
	const event = {
		request: new Request('https://pauseai.info/'),
		route: { id: routeId }
	}
	await handle({
		event: event as never,
		resolve: (async (
			_event: unknown,
			opts?: { transformPageChunk?: (input: { html: string; done: boolean }) => string }
		) => {
			out = opts?.transformPageChunk?.({ html: appHtml, done: true }) ?? appHtml
			return new Response(out)
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
		for (const id of ['/', '/join', '/[slug]', null]) {
			const html = await render(id)
			expect(html).toContain('googletagmanager.com/gtm.js')
			expect(html).toContain('googletagmanager.com/ns.html')
		}
	})

	it('is removed from embed pages, leaving the rest of the page', async () => {
		for (const id of ['/embed/onboarding-form', '/embed/statement-form']) {
			const html = await render(id)
			expect(html).not.toMatch(/googletagmanager|dataLayer|Google Tag Manager/)
			expect(html).toContain('<html lang="de">')
			expect(html).toContain('%sveltekit.head%')
			expect(html).toContain('%sveltekit.body%')
		}
	})
})
