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

	it('says that signing publishes the signature, just before the submit button', () => {
		expect(body).toMatch(
			/id="statement-bio"[\s\S]*By\s+signing,\s+you\s+publish\s+your\s+name\s+\(or\s+(&quot;|")Anonymous(&quot;|"),\s+if\s+you\s+ticked\s+the\s+box\s+above\),\s+country\s+and\s+what\s+you\s+wrote[\s\S]*<button[^>]*type="submit"/
		)
		expect(body).toMatch(
			/Your\s+country\s+and\s+what\s+you\s+write\s+are\s+still\s+published,\s+so\s+leave\s+out\s+details\s+that\s+could\s+identify\s+you/
		)
		expect(body).toMatch(/<button[^>]*aria-describedby="statement-publish-note"/)
	})

	it('labels the submit button with what it does', () => {
		expect(body).toMatch(/<button[^>]*type="submit"[^>]*>Sign the statement<\/button>/)
	})

	it('marks the bio as optional and keeps its prompt as a placeholder', () => {
		expect(body).toMatch(/Why does this matter to you\?\s+<span[^>]*>\(optional\)<\/span>/)
		expect(body).toMatch(
			/<textarea[^>]*placeholder="Share who you are and why addressing AI risks is important to you"/
		)
	})

	it('heads the card as the page itself, as the embed has no other heading', () => {
		expect(body).toMatch(/<h1[^>]*id="sign-heading"/)
		expect(body).not.toMatch(/<h2[^>]*id="sign-heading"/)
	})
})
