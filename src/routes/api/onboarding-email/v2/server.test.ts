import { url } from '$lib/config.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError: vi.fn() }))

const { POST } = await import('./+server.js')

const SECRET = 'test-v2-secret'
const LINK = `${url}/verify?table=join&verificationKey=recTest1234567890`
const BODY = {
	version: 2,
	first_name: 'Alex',
	language: 'en',
	intent: 'Volunteer',
	keep_informed: true,
	routing: { kind: 'chapter', chapter_id: 12, name: 'PauseAI Netherlands', country: 'Netherlands' },
	verification_link: LINK
}

function post(body: unknown, authorization: string | null = `Bearer ${SECRET}`) {
	const headers: Record<string, string> = { 'content-type': 'application/json' }
	if (authorization !== null) headers.authorization = authorization
	const request = new Request('https://pauseai.info/api/onboarding-email/v2', {
		method: 'POST',
		headers,
		body: typeof body === 'string' ? body : JSON.stringify(body)
	})
	return POST({ request } as Parameters<typeof POST>[0])
}

type Rendered = Record<string, unknown> & { text: string; subject: string }
type Refusal = { error: { code: string; message: string } }

const rendered = async (response: Response) => (await response.json()) as Rendered
const refusal = async (response: Response) => ((await response.json()) as Refusal).error

beforeEach(() => {
	env.ONBOARDING_RENDER_V2_SECRET = SECRET
	env.ONBOARDING_EMAIL_RENDER_SECRET = 'the-v1-secret'
})

describe('POST /api/onboarding-email/v2', () => {
	it('renders with the version and the variant it chose', async () => {
		const response = await post(BODY)
		expect(response.status).toBe(200)
		const json = await rendered(response)
		expect(json).toMatchObject({ version: 2, language: 'en', chapter_override: null })
		expect(json.subject).toBe('Welcome to PauseAI, Alex!')
		expect(json.text).toContain(LINK)
		expect(json.text).toContain('PauseAI Netherlands will be in touch')
		expect(json).not.toHaveProperty('from')
	})

	it.each([
		['no header', null],
		['a wrong secret', 'Bearer nope'],
		["v1's secret", 'Bearer the-v1-secret'],
		['the secret without the scheme', SECRET]
	])('refuses %s', async (_name, authorization) => {
		const response = await post(BODY, authorization)
		expect(response.status).toBe(401)
		expect((await refusal(response)).code).toBe('unauthorized')
	})

	it('refuses everything while its secret is unset', async () => {
		env.ONBOARDING_RENDER_V2_SECRET = undefined
		expect((await post(BODY, 'Bearer ')).status).toBe(401)
		expect((await post(BODY, 'Bearer undefined')).status).toBe(401)
	})

	it('refuses a body that is not JSON', async () => {
		const response = await post('{not json')
		expect(response.status).toBe(400)
		expect((await refusal(response)).code).toBe('invalid_json')
	})

	it('refuses another version', async () => {
		const response = await post({ ...BODY, version: 1 })
		expect(response.status).toBe(400)
		expect((await refusal(response)).code).toBe('unsupported_version')
	})

	it('names the field it refuses', async () => {
		const response = await post({ ...BODY, verification_link: 'https://example.org/verify' })
		expect(response.status).toBe(400)
		const error = await refusal(response)
		expect(error.code).toBe('invalid_request')
		expect(error.message).toContain('verification_link')
	})
})
