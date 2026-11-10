import { render } from 'svelte/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('$app/state', () => ({
	page: { url: new URL('https://pauseai.info/verify') }
}))
vi.mock('$app/navigation', () => ({
	afterNavigate: () => {},
	goto: () => {},
	replaceState: () => {},
	pushState: () => {}
}))

const { default: Page } = await import('./+page.svelte')
const { default: SignatureConfirmed } = await import('./SignatureConfirmed.svelte')

describe('/verify', () => {
	it('confirms without promising the signature is listed yet', () => {
		const { body } = render(SignatureConfirmed)
		expect(body).toMatch(/<h1[^>]*>Your signature is confirmed<\/h1>/)
		expect(body).toMatch(/It\s+will\s+be\s+added\s+to\s+the\s+public\s+list\s+of\s+signatures/)
	})

	it('invites a confirmed signer to join PauseAI and to share the statement', () => {
		const { body } = render(SignatureConfirmed)
		expect(body).toMatch(/Get involved[\s\S]*<a href="\/join"[^>]*>(<!---->)?Join PauseAI/)
		expect(body).toMatch(/Spread the word[\s\S]*<button[^>]*>Copy link<\/button>/)
		expect(body).toMatch(/aria-live="polite"/)
	})

	it('server-renders no invite on first load', () => {
		const { body } = render(Page)
		expect(body).toMatch(/Processing your request/)
		expect(body).not.toMatch(/href="\/join"/)
	})
})
