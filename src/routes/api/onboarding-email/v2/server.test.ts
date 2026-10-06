import { beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError: vi.fn() }))
vi.mock('$lib/airtable.js', async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	fetchAllPages: () =>
		Promise.resolve([
			{
				id: 'recNetherlands',
				fields: { country: 'Netherlands', whatsapp: 'https://chat.whatsapp.com/example' }
			}
		])
}))

const { POST } = await import('./+server.js')
const { verifyVerificationToken } = await import('$lib/server/emailVerification')

const SECRET = 'test-v2-secret'
const RECORD_ID = 'recTest1234567890'
const TO_EMAIL = 'alex@example.org'
const VERIFICATION_SECRET = 'verification-secret'
const BODY = {
	version: 2,
	first_name: 'Alex',
	languages: ['English'],
	country_code: 'NL',
	intent: 'Volunteer',
	keep_informed: true,
	routing: { kind: 'chapter', chapter_id: 12, name: 'PauseAI Netherlands', country_code: 'NL' },
	record_id: RECORD_ID,
	to_email: TO_EMAIL
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
	env.EMAIL_VERIFICATION_SECRET = VERIFICATION_SECRET
	env.CRM_INTAKE_URL = 'https://crm.pauseai.info'
})

describe('POST /api/onboarding-email/v2', () => {
	it('renders with the version and the variant it chose', async () => {
		const response = await post(BODY)
		expect(response.status).toBe(200)
		const json = await rendered(response)
		expect(json).toMatchObject({ version: 2, language: 'en', chapter_override: null })
		expect(json.subject).toBe('Welcome to PauseAI, Alex!')
		expect(json.text).toContain('verificationKey=Test1234567890&token=')
		const token = /[?&]token=(v1\.\d+\.[A-Za-z0-9_-]{43})/.exec(json.text)?.[1] ?? ''
		expect(
			await verifyVerificationToken(VERIFICATION_SECRET, RECORD_ID, TO_EMAIL, token, Date.now())
		).toBe('valid')
		expect(JSON.stringify(json)).not.toContain(TO_EMAIL)
		expect(json.text).toContain('PauseAI Netherlands will be in touch')
		expect(json.text).toContain('https://chat.whatsapp.com/example')
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

	it('refuses to render while links cannot be signed', async () => {
		env.EMAIL_VERIFICATION_SECRET = undefined
		const response = await post(BODY)
		expect(response.status).toBe(503)
		expect((await refusal(response)).code).toBe('verification_unavailable')
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

	it('resolves the language from languages', async () => {
		const response = await post({ ...BODY, languages: ['Spanish'] })
		expect(response.status).toBe(200)
		expect(await rendered(response)).toMatchObject({ language: 'es' })
	})

	it('renders the unsubscribe line only when given a link on the CRM', async () => {
		const unsubscribe_url = 'https://crm.pauseai.info/civicrm/mailing/optout?cid=1&cs=abc'
		const json = await rendered(await post({ ...BODY, unsubscribe_url }))
		expect(json.text).toContain(`[Unsubscribe from all PauseAI emails](${unsubscribe_url})`)
		expect((await rendered(await post(BODY))).text).not.toContain('Unsubscribe')
		const response = await post({ ...BODY, unsubscribe_url: 'https://example.org/optout' })
		expect(response.status).toBe(400)
		expect((await refusal(response)).message).toContain('unsubscribe_url')
	})

	it('names the field it refuses', async () => {
		const response = await post({ ...BODY, record_id: 'Test1234567890' })
		expect(response.status).toBe(400)
		const error = await refusal(response)
		expect(error.code).toBe('invalid_request')
		expect(error.message).toContain('record_id')
	})
})
