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

const JOIN_INVITE = /Want to do more\?[\s\S]*<a href="\/join"[^>]*>(<!---->)?Join PauseAI/

describe('/verify', () => {
	it('invites a confirmed signer to join PauseAI', () => {
		expect(render(SignatureConfirmed).body).toMatch(JOIN_INVITE)
	})

	it('shows no invite before a verification has succeeded', () => {
		const { body } = render(Page)
		expect(body).toMatch(/Processing your request/)
		expect(body).not.toMatch(/href="\/join"/)
	})
})
