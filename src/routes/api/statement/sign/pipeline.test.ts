// Runs requests through SvelteKit's real Server, as a production build does: its CSRF check,
// routing, method handling and hooks.server.ts, which handler tests skip. Airtable and
// Turnstile are mocked. It reaches into SvelteKit's internals for the Server class and hands
// it a manifest of only these routes, so a SvelteKit upgrade may need this file updated.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Server as KitServer, SSRManifest } from '@sveltejs/kit'
// @ts-expect-error -- SvelteKit's internals have no type declarations, so typed just below
import { Server as InternalServer } from '../../../../../node_modules/@sveltejs/kit/src/runtime/server/index.js'

const Server = InternalServer as typeof KitServer

const env: Record<string, string | undefined> = {}
const createRecord = vi.fn<(...args: unknown[]) => Promise<unknown>>()
const hasMatchingRecord = vi.fn<(...args: unknown[]) => Promise<boolean | 'failed'>>()
const verifyTurnstile = vi.fn<(...args: unknown[]) => Promise<{ ok: boolean; message?: string }>>()

// Dev would make any hostname a dry run, and this is about production.
vi.mock('$app/environment', () => ({ browser: false, building: false, dev: false, version: '' }))
vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('#lib/airtable.ts', () => ({
	airtableFormulaString: (value: string) => `"${value}"`,
	createRecord,
	hasMatchingRecord
}))
vi.mock('#lib/server/turnstile-verify.ts', () => ({ verifyTurnstile }))

const SITE = 'https://pauseai.info'
const CHAPTER = 'https://pauseai.es'
const ENDPOINT = `${SITE}/api/statement/sign`
const ACTION = `${SITE}/statement/sign`
const VALID = {
	name: 'Ada Lovelace',
	email: 'ada@example.org',
	country: 'Spain',
	private: false,
	turnstile_token: 'a-token'
}
const FORM = new URLSearchParams({
	name: 'Ada Lovelace',
	email: 'ada@example.org',
	country: 'Spain',
	turnstile_token: 'a-token'
})

const manifest = {
	appDir: '_app',
	appPath: '_app',
	assets: new Set<string>(),
	mimeTypes: {},
	_: {
		client: {
			start: '',
			app: '',
			imports: [],
			stylesheets: [],
			fonts: [],
			uses_env_dynamic_public: false
		},
		nodes: [
			// The layout and error page, which action requests load but never render.
			() => Promise.resolve({ index: 0 }),
			() => Promise.resolve({ index: 1 }),
			async () => ({ index: 2, server: await import('../../../statement/sign/+page.server.js') })
		],
		remotes: {},
		routes: [
			{
				id: '/api/statement/sign',
				pattern: /^\/api\/statement\/sign\/?$/,
				params: [],
				page: null,
				endpoint: () => import('./+server.js')
			},
			{
				id: '/statement/sign',
				pattern: /^\/statement\/sign\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set<string>(),
		matchers: () => Promise.resolve({})
	}
}

let server: KitServer

function send(url: string, init: RequestInit) {
	return server.respond(new Request(url, { redirect: 'manual', ...init }), {
		getClientAddress: () => '192.0.2.1'
	})
}

function postJson(origin: string | null, body: unknown = VALID) {
	return send(ENDPOINT, {
		method: 'POST',
		headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}) },
		body: JSON.stringify(body)
	})
}

// As use:enhance posts: urlencoded, asking for the action's answer as JSON.
function postAction(origin: string | null, body: URLSearchParams = FORM) {
	return send(ACTION, {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			accept: 'application/json',
			'x-sveltekit-action': 'true',
			...(origin ? { origin } : {})
		},
		body
	})
}

beforeAll(async () => {
	// The CSRF check only exists outside dev, and production is what this is about.
	vi.stubGlobal('__SVELTEKIT_DEV__', false)
	server = new Server(manifest as unknown as SSRManifest)
	await server.init({ env: {} })
})

afterAll(() => {
	vi.unstubAllGlobals()
})

beforeEach(async () => {
	const { resetRateLimits } = await import('#lib/server/rateLimit.ts')
	resetRateLimits()
	env.STATEMENT_SIGNING_LIVE = 'true'
	createRecord.mockReset().mockResolvedValue({ id: 'recAda', createdTime: '', fields: {} })
	hasMatchingRecord.mockReset().mockResolvedValue(false)
	verifyTurnstile.mockReset().mockResolvedValue({ ok: true })
	vi.spyOn(console, 'log').mockImplementation(() => {})
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('the endpoint through the SvelteKit pipeline', () => {
	it('saves a JSON signature from a chapter site, with CORS headers intact', async () => {
		const response = await postJson(CHAPTER)

		expect(response.status).toBe(202)
		expect(await response.json()).toEqual({ ok: true, status: 'pending_verification' })
		expect(response.headers.get('access-control-allow-origin')).toBe(CHAPTER)
		expect(response.headers.get('access-control-expose-headers')).toBe('Retry-After')
		expect(createRecord).toHaveBeenCalledOnce()
	})

	it('holds a server caller, with no Origin, to the same token check', async () => {
		verifyTurnstile.mockResolvedValue({ ok: false, message: 'failed' })
		const response = await postJson(null, { ...VALID, turnstile_token: undefined })

		expect(response.status).toBe(403)
		expect(await response.json()).toEqual({ ok: false, error: 'turnstile_failed' })
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('answers a preflight', async () => {
		const response = await send(ENDPOINT, { method: 'OPTIONS', headers: { origin: CHAPTER } })

		expect(response.status).toBe(204)
		expect(response.headers.get('access-control-allow-origin')).toBe(CHAPTER)
		expect(response.headers.get('access-control-allow-methods')).toContain('POST')
	})

	it('reports the signing mode', async () => {
		env.STATEMENT_SIGNING_LIVE = undefined
		const response = await send(ENDPOINT, { method: 'GET' })

		expect(await response.json()).toEqual({ mode: 'off' })
	})

	it('answers 503 on the real site when signing is off', async () => {
		env.STATEMENT_SIGNING_LIVE = undefined
		const response = await postJson(CHAPTER)

		expect(response.status).toBe(503)
		expect(await response.json()).toEqual({ ok: false, error: 'signing_unavailable' })
	})

	it('exposes Retry-After on a real 429', async () => {
		for (let save = 0; save < 30; save++) expect((await postJson(CHAPTER)).status).toBe(202)
		const limited = await postJson(CHAPTER)

		expect(limited.status).toBe(429)
		expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0)
		expect(limited.headers.get('access-control-expose-headers')).toBe('Retry-After')
	})

	it('answers 415 for a type that is not form-like, as the handler does run', async () => {
		const response = await send(ENDPOINT, {
			method: 'POST',
			headers: { 'content-type': 'application/xml', origin: CHAPTER },
			body: '<a/>'
		})

		expect(response.status).toBe(415)
		expect(await response.json()).toEqual({ ok: false, error: 'unsupported_media_type' })
	})

	describe.each(['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'])(
		'with %s, which SvelteKit refuses before the handler',
		(contentType) => {
			it.each([
				['a chapter site', CHAPTER],
				['a server, with no Origin', null]
			])('answers 403 plain text with no CORS header, from %s', async (_label, origin) => {
				const response = await send(ENDPOINT, {
					method: 'POST',
					headers: { 'content-type': contentType, ...(origin ? { origin } : {}) },
					body: JSON.stringify(VALID)
				})

				expect(response.status).toBe(403)
				expect(await response.text()).toBe('Cross-site POST form submissions are forbidden')
				expect(response.headers.get('access-control-allow-origin')).toBeNull()
				expect(createRecord).not.toHaveBeenCalled()
			})

			it('reaches the handler and answers 415 from the site itself', async () => {
				const response = await send(ENDPOINT, {
					method: 'POST',
					headers: { 'content-type': contentType, origin: SITE },
					body: JSON.stringify(VALID)
				})

				expect(response.status).toBe(415)
			})
		}
	)
})

describe('the form action through the SvelteKit pipeline', () => {
	it('saves a signature from the site itself', async () => {
		const response = await postAction(SITE)

		expect(response.status).toBe(200)
		expect(await response.json()).toMatchObject({ type: 'success' })
		expect(createRecord).toHaveBeenCalledOnce()
	})

	it.each([
		['a chapter site', CHAPTER],
		['another site', 'https://evil.example'],
		['a caller with no Origin', null]
	])('keeps its CSRF protection against %s', async (_label, origin) => {
		const response = await postAction(origin)

		expect(response.status).toBe(403)
		expect(createRecord).not.toHaveBeenCalled()
		expect(verifyTurnstile).not.toHaveBeenCalled()
	})

	it('shows a form error when signing is off', async () => {
		env.STATEMENT_SIGNING_LIVE = undefined
		const response = await postAction(SITE)
		const answer = (await response.json()) as { type: string; status: number; data: string }

		expect(answer.type).toBe('failure')
		expect(answer.status).toBe(503)
		expect(answer.data).toContain('nothing was saved')
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('shows a repeat signature as a success, writing nothing', async () => {
		hasMatchingRecord.mockResolvedValue(true)
		const response = await postAction(SITE)

		expect(await response.json()).toMatchObject({ type: 'success' })
		expect(createRecord).not.toHaveBeenCalled()
	})
})
