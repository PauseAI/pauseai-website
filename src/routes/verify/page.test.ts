import { render } from 'svelte/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const page = vi.hoisted(() => ({ url: new URL('https://pauseai.info/verify') }))
const afterNavigate = vi.hoisted(() => vi.fn<(callback: () => void) => void>())
const sentry = vi.hoisted(() => ({ captureException: vi.fn(), captureMessage: vi.fn() }))

vi.mock('$app/state', () => ({ page }))
vi.mock('@sentry/svelte', () => sentry)
vi.mock('$app/navigation', () => ({
	afterNavigate,
	goto: () => {},
	replaceState: () => {},
	pushState: () => {}
}))

const { default: Page } = await import('./+page.svelte')
const { default: SignatureConfirmed } = await import('./SignatureConfirmed.svelte')
const { default: LinkProblem } = await import('./LinkProblem.svelte')

/** Runs the page's start-up for `search` as a client navigation would, and lets it settle. */
async function openPage(search: string) {
	page.url = new URL(`https://pauseai.info/verify${search}`)
	// render is lazy: reading body runs the component, which registers its afterNavigate.
	afterNavigate.mockClear()
	void render(Page).body
	const [start] = afterNavigate.mock.calls[0]
	start()
	// A timer runs only once the microtasks of the mocked fetch chain have drained.
	await new Promise((resolve) => setTimeout(resolve, 0))
}

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

	it.each([
		['missing', /No verification link found/, /opened without a verification link/],
		['notFound', /This link is not valid/, /could not match this link to a signup/]
	] as const)('explains a link problem (%s)', (reason, heading, explanation) => {
		const { body } = render(LinkProblem, { props: { reason } })
		expect(body).toMatch(heading)
		expect(body).toMatch(explanation)
		expect(body).toMatch(/open the link from your email again/)
		expect(body).toMatch(/href="mailto:info@pauseai.info"/)
	})
})

// Vitest fails the run on an unhandled rejection, so every test here also checks there is none.
describe('/verify start-up', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		sentry.captureException.mockClear()
		sentry.captureMessage.mockClear()
	})

	it.each(['', '?table=statement'])(
		'posts nothing when the link has no key (%j)',
		async (search) => {
			const fetch = vi.fn()
			vi.stubGlobal('fetch', fetch)
			await openPage(search)
			expect(fetch).not.toHaveBeenCalled()
		}
	)

	it.each([400, 404])(
		'handles a %i without an unhandled rejection or a Sentry report',
		async (status) => {
			const fetch = vi.fn().mockResolvedValue(new Response('Record not found', { status }))
			vi.stubGlobal('fetch', fetch)
			await openPage('?verificationKey=abc')
			expect(fetch).toHaveBeenCalledOnce()
			expect(sentry.captureException).not.toHaveBeenCalled()
			expect(sentry.captureMessage).not.toHaveBeenCalled()
		}
	)

	it('reports a gateway error to Sentry once, without an unhandled rejection', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 502 })))
		await openPage('?verificationKey=abc')
		expect(sentry.captureMessage).toHaveBeenCalledOnce()
		expect(sentry.captureMessage).toHaveBeenCalledWith(
			expect.stringContaining('502'),
			expect.objectContaining({ fingerprint: ['verify', 'http', '502'] })
		)
		expect(sentry.captureException).not.toHaveBeenCalled()
	})

	it('reports a failed request to Sentry once, without an unhandled rejection', async () => {
		const error = new TypeError('Failed to fetch')
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
		await openPage('?verificationKey=abc')
		expect(sentry.captureException).toHaveBeenCalledOnce()
		expect(sentry.captureException).toHaveBeenCalledWith(error)
	})
})
