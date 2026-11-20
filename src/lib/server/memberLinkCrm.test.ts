import { beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const reportError =
	vi.fn<(error: unknown, context?: Record<string, unknown>, options?: unknown) => Promise<void>>()
const flushReports = vi.fn<() => Promise<void>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/server/sentry', () => ({ reportError, flushReports }))

const { memberLinkBackend, verifyMemberLinkInCrm } = await import('./memberLinkCrm.js')

const KEY = 'AbCdEf12345678'
const TOKEN = 'v1.1800000000.abc'

const fetchMock = vi.fn<typeof fetch>()
const reply = (body: unknown, status = 200) =>
	Promise.resolve(new Response(JSON.stringify(body), { status }))
const answerRow = (row: Record<string, unknown>) =>
	fetchMock.mockImplementation(() => reply({ values: [row] }))

beforeEach(() => {
	for (const key of Object.keys(env)) delete env[key]
	env.CRM_URL = 'https://crm.example.org'
	env.CRM_KEY = 'test-key-not-real'
	fetchMock.mockReset()
	answerRow({ status: 'ok' })
	vi.stubGlobal('fetch', fetchMock)
	reportError.mockReset().mockResolvedValue()
	flushReports.mockReset().mockResolvedValue()
	vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('memberLinkBackend', () => {
	it.each([
		[undefined, 'airtable'],
		['airtable', 'airtable'],
		['CiviCRM', 'airtable'],
		['civicrm', 'civicrm']
	])('reads %s as %s', (value, backend) => {
		env.MEMBER_LINK_BACKEND = value
		expect(memberLinkBackend()).toBe(backend)
	})
})

describe('verifyMemberLinkInCrm', () => {
	it("sends the link's key and token as they arrived", async () => {
		await verifyMemberLinkInCrm(KEY, TOKEN)

		const [url, init] = fetchMock.mock.calls[0]
		expect(url).toBe('https://crm.example.org/civicrm/ajax/api4/PauseaiMemberIntake/verify')
		const params = (init?.body as URLSearchParams).get('params')!
		expect(JSON.parse(params)).toEqual({ key: KEY, token: TOKEN })
	})

	it.each(['ok', 'expired', 'invalid'])('answers %s as CiviCRM does', async (status) => {
		answerRow({ status })

		expect(await verifyMemberLinkInCrm(KEY, TOKEN)).toBe(status)
		expect(reportError).not.toHaveBeenCalled()
	})

	it('reports an error or an unknown answer as failed, without the token', async () => {
		fetchMock.mockImplementation(() => reply({}, 500))
		expect(await verifyMemberLinkInCrm(KEY, TOKEN)).toBe('failed')
		answerRow({ status: 'something_new' })
		expect(await verifyMemberLinkInCrm(KEY, TOKEN)).toBe('failed')

		expect(reportError).toHaveBeenCalledTimes(2)
		const [error, context, options] = reportError.mock.calls[0]
		expect((error as Error).message).toBe('CRM member link verify error')
		expect(context).toMatchObject({ recordId: `rec${KEY}`, cause: 'http', httpStatus: 500 })
		expect(options).toEqual({
			fingerprint: ['crm-member-link', 'verify', 'error'],
			level: 'error',
			tags: { check: 'crm-member-link' }
		})
		expect(JSON.stringify(reportError.mock.calls)).not.toContain(TOKEN)
	})
})
