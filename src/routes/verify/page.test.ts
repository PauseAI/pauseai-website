import { render } from 'svelte/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const page = vi.hoisted(() => ({ url: new URL('https://pauseai.info/verify') }))
const afterNavigate = vi.hoisted(() => vi.fn<(callback: () => void) => void>())
const sentry = vi.hoisted(() => ({ captureException: vi.fn() }))

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
const { default: LinkMissing } = await import('./LinkMissing.svelte')

/** Runs the page's start-up for `search` as a client navigation would, and lets it settle. */
async function openPage(search: string) {
	page.url = new URL(`https://pauseai.info/verify${search}`)
	// render is lazy: reading body runs the component, which registers its afterNavigate.
	afterNavigate.mockClear()
	void render(Page).body
	const [start] = afterNavigate.mock.calls[0]
	start()
	for (let i = 0; i < 5; i++) await new Promise((resolve) => setTimeout(resolve, 0))
}

/** Collects unhandled rejections raised while `run` executes. */
async function unhandledRejections(run: () => Promise<void>) {
	const rejections: unknown[] = []
	const listener = (reason: unknown) => rejections.push(reason)
	process.on('unhandledRejection', listener)
	try {
		await run()
		await new Promise((resolve) => setTimeout(resolve, 10))
	} finally {
		process.off('unhandledRejection', listener)
	}
	return rejections
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

	it('explains a missing link instead of the raw API error', () => {
		const { body } = render(LinkMissing)
		expect(body).toMatch(/<h1[^>]*>No verification link found<\/h1>/)
		expect(body).toMatch(/If you already confirmed your email, there is nothing more to do/)
		expect(body).toMatch(/href="mailto:info@pauseai.info"/)
	})
})

describe('/verify start-up', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		sentry.captureException.mockClear()
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

	it('shows a refused link without an unhandled rejection or a Sentry report', async () => {
		const fetch = vi.fn().mockResolvedValue(new Response('Parameter "x" is wrong', { status: 400 }))
		vi.stubGlobal('fetch', fetch)
		expect(await unhandledRejections(() => openPage('?verificationKey=abc'))).toEqual([])
		expect(fetch).toHaveBeenCalledOnce()
		expect(sentry.captureException).not.toHaveBeenCalled()
	})

	it('reports a failed request to Sentry once, without an unhandled rejection', async () => {
		const error = new TypeError('Failed to fetch')
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
		expect(await unhandledRejections(() => openPage('?verificationKey=abc'))).toEqual([])
		expect(sentry.captureException).toHaveBeenCalledOnce()
		expect(sentry.captureException).toHaveBeenCalledWith(error)
	})
})
