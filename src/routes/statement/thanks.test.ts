import { render } from 'svelte/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('$app/state', () => ({
	page: { url: new URL('https://pauseai.info/statement') }
}))

const { default: StatementThanks } = await import('./StatementThanks.svelte')

describe('StatementThanks', () => {
	it('invites every signer to join PauseAI', () => {
		const { body } = render(StatementThanks)
		expect(body).toMatch(/Want to do more\?[\s\S]*<a href="\/join"[^>]*>(<!---->)?Join PauseAI/)
		expect(body).not.toMatch(/<a href="\/join"[^>]*target=/)
	})

	it('opens the invite in a new tab from the chapter-site iframe', () => {
		const { body } = render(StatementThanks, { props: { embedded: true } })
		expect(body).toMatch(/<a href="\/join" target="_blank"/)
	})
})
