import { render } from 'svelte/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('$app/state', () => ({
	page: { url: new URL('https://pauseai.info/embed/statement-form') }
}))

const { default: Page } = await import('./+page.svelte')

describe('/embed/statement-form', () => {
	const { body } = render(Page)

	it('posts to the same action as /statement', () => {
		expect(body).toMatch(/<form[^>]*method="POST"[^>]*action="\/statement\/sign"/)
	})

	it('points visitors without JavaScript to /statement in a new tab', () => {
		expect(body).toMatch(
			/<noscript>[\s\S]*<a href="https:\/\/pauseai.info\/statement" target="_blank"/
		)
	})

	it('heads the card as the page itself, as the embed has no other heading', () => {
		expect(body).toMatch(/<h1[^>]*id="sign-heading"/)
		expect(body).not.toMatch(/<h2[^>]*id="sign-heading"/)
	})
})
