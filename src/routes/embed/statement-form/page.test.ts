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

	it('says that signing publishes the signature, before the fields', () => {
		expect(body).toMatch(
			/Signing publishes your name \(or (&quot;|")Anonymous(&quot;|"), if you tick the box below\), country\s+and\s+what\s+you\s+write[\s\S]*id="statement-name"/
		)
		expect(body).toMatch(
			/Your\s+country\s+and\s+what\s+you\s+write\s+are\s+still\s+published,\s+so\s+leave\s+out\s+details\s+that\s+could\s+identify\s+you/
		)
		expect(body).toMatch(/<button[^>]*aria-describedby="statement-publish-note"/)
	})

	it('heads the card as the page itself, as the embed has no other heading', () => {
		expect(body).toMatch(/<h1[^>]*id="sign-heading"/)
		expect(body).not.toMatch(/<h2[^>]*id="sign-heading"/)
	})
})
