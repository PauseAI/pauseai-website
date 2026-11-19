import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContactRequest, ContactSendResult } from '$lib/server/contactCrm'

const checkNotSpam =
	vi.fn<(...args: unknown[]) => Promise<{ drop: true } | { drop: false; message?: string }>>()
const sendContactToCrm =
	vi.fn<(request: ContactRequest, options: Record<string, unknown>) => Promise<ContactSendResult>>()

vi.mock('$app/environment', () => ({ dev: false }))
vi.mock('$env/dynamic/private', () => ({ env: {} }))
vi.mock('$lib/server/turnstile-verify', () => ({ checkNotSpam }))
vi.mock('$lib/server/contactCrm', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/server/contactCrm')>()),
	sendContactToCrm
}))

const { actions } = await import('./+page.server.js')

type Action = 'media' | 'partnerships' | 'feedback'
type Result = { status?: number; data?: { message?: string } } & Record<string, unknown>

const PARTNERSHIP = 'Collaborate on grant applications'
const VALID: Record<Action, Record<string, string>> = {
	media: {
		name: 'Ada Lovelace',
		email: 'ada@example.org',
		subject: 'Interview request',
		organization: 'The Analytical Times',
		details: 'Could we talk on Friday?'
	},
	partnerships: {
		name: 'Ada Lovelace',
		email: 'ada@example.org',
		organization: 'Difference Ltd',
		city_country: 'London, UK',
		partnership_type: PARTNERSHIP,
		message: 'Shall we work together?'
	},
	feedback: { subject: 'Your website', message: 'It is lovely.' }
}
const INBOX: Record<Action, string> = {
	media: 'press@pauseai.info',
	partnerships: 'partnerships@pauseai.info',
	feedback: 'feedback@pauseai.info'
}

async function submit(action: Action, fields: Record<string, string>): Promise<Result> {
	const url = new URL('https://pauseai.info/contact-us')
	const request = new Request(url, { method: 'POST', body: new URLSearchParams(fields) })
	return (await actions[action]({ request, url, platform: undefined } as never)) as Result
}

const sent = () => sendContactToCrm.mock.calls[0][0]

beforeEach(() => {
	checkNotSpam.mockReset().mockResolvedValue({ drop: false })
	sendContactToCrm.mockReset().mockResolvedValue('ok')
})
afterEach(() => {
	vi.restoreAllMocks()
})

describe('contact form actions', () => {
	it('sends a media enquiry, its details as the message', async () => {
		expect(await submit('media', VALID.media)).toEqual({ success: true })
		expect(sent()).toEqual({
			type: 'Media',
			name: 'Ada Lovelace',
			email: 'ada@example.org',
			subject: 'Interview request',
			message: 'Could we talk on Friday?',
			organization: 'The Analytical Times'
		})
	})

	it('sends a partnership enquiry, its chosen type as the subject', async () => {
		expect(await submit('partnerships', VALID.partnerships)).toEqual({ success: true })
		expect(sent()).toEqual({
			type: 'Partnerships',
			name: 'Ada Lovelace',
			email: 'ada@example.org',
			subject: PARTNERSHIP,
			message: 'Shall we work together?',
			organization: 'Difference Ltd',
			city_country: 'London, UK'
		})
	})

	it('makes the subject "Other: <text>" for another kind of partnership, organization optional', async () => {
		const fields = { ...VALID.partnerships }
		delete fields.organization
		await submit('partnerships', {
			...fields,
			partnership_type: 'Other',
			other_partnership_type: 'Analytical engines'
		})
		expect(sent()).toMatchObject({ subject: 'Other: Analytical engines', organization: '' })
	})

	it('sends feedback without a name or an email', async () => {
		expect(await submit('feedback', VALID.feedback)).toEqual({ success: true })
		expect(sent()).toEqual({
			type: 'Feedback',
			name: '',
			email: '',
			subject: 'Your website',
			message: 'It is lovely.'
		})
	})

	it('gives the CRM a deadline from the request start and the hostname', async () => {
		const before = Date.now()
		await submit('feedback', VALID.feedback)
		const options = sendContactToCrm.mock.calls[0][1]
		expect(options.hostname).toBe('pauseai.info')
		expect(options.deadline).toBeGreaterThanOrEqual(before + 20_000)
		expect(options.deadline).toBeLessThanOrEqual(Date.now() + 20_000)
	})

	it('keeps validation and Turnstile ahead of the CRM', async () => {
		checkNotSpam.mockResolvedValueOnce({ drop: true })
		expect(await submit('media', VALID.media)).toEqual({ success: true })

		checkNotSpam.mockResolvedValueOnce({ drop: false, message: 'Turnstile said no' })
		expect((await submit('media', VALID.media)).status).toBe(403)

		expect((await submit('media', { ...VALID.media, email: 'not-an-email' })).status).toBe(400)
		expect(
			(await submit('partnerships', { ...VALID.partnerships, partnership_type: 'Made up' })).status
		).toBe(400)
		expect(sendContactToCrm).not.toHaveBeenCalled()
	})

	for (const action of ['media', 'partnerships', 'feedback'] as const) {
		it(`names ${INBOX[action]} when the CRM refuses or fails a ${action} enquiry`, async () => {
			sendContactToCrm.mockResolvedValueOnce('refused')
			const refused = await submit(action, VALID[action])
			expect(refused.status).toBe(400)
			expect(refused.data?.message).toBe(
				`We couldn't accept your message as entered. Please check your details, or email us at ${INBOX[action]}.`
			)

			sendContactToCrm.mockResolvedValueOnce('failed')
			const failed = await submit(action, VALID[action])
			expect(failed.status).toBe(503)
			expect(failed.data?.message).toBe(
				`Sorry, we couldn't send your message. Please email us at ${INBOX[action]} instead.`
			)
		})
	}
})
