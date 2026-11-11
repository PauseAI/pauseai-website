import { render } from 'svelte/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('$app/state', () => ({
	page: { url: new URL('https://pauseai.info/statement') }
}))

const { default: StatementThanks } = await import('./StatementThanks.svelte')

describe('StatementThanks', () => {
	it('asks the signer to confirm from the email', () => {
		const { body } = render(StatementThanks)
		expect(body).toMatch(/Thank you for signing!/)
		expect(body).toMatch(
			/Check\s+your\s+inbox\s+\(and\s+spam\s+folder\)\s+for\s+our\s+email,\s+and\s+click\s+its\s+link\s+to\s+confirm\s+your\s+signature/
		)
	})

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
