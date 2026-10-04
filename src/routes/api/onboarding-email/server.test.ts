import { beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const getRecord =
	vi.fn<(...args: unknown[]) => Promise<Record<string, unknown> | 'missing' | 'failed'>>()
const reportError = vi.fn<(error: unknown, context?: Record<string, unknown>) => Promise<void>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/airtable', () => ({ getRecord }))
vi.mock('$lib/server/sentry', () => ({ reportError }))
vi.mock('$lib/server/onboardingEmail/chapter.js', () => ({
	getChapterForOnboardingEmail: () => Promise.resolve(null)
}))

const { POST } = await import('./+server.js')
const { verifyVerificationToken } = await import('$lib/server/emailVerification')

const RENDER_SECRET = 'render-secret'
const SECRET = 'verification-secret'
// What the Airtable sender posts: its `Airtable ID`, the record id without `rec`.
const AIRTABLE_ID = 'Ada0123456789x'

const render = (body: Record<string, unknown>) =>
	POST({
		request: new Request('https://pauseai.info/api/onboarding-email', {
			method: 'POST',
			headers: { authorization: `Bearer ${RENDER_SECRET}` },
			body: JSON.stringify(body)
		})
	} as Parameters<typeof POST>[0])

const SIGNUP = {
	first_name: 'Ada',
	country: 'Netherlands',
	intent: 'Volunteer',
	airtable_id: AIRTABLE_ID,
	gdpr_chapter_share: true
}

function linksIn(text: string): URL[] {
	return [...text.matchAll(/https?:\/\/[^\s"<>)]+\/verify\?[^\s"<>)]+/g)].map(
		(match) => new URL(match[0].replace(/&amp;/g, '&'))
	)
}

beforeEach(() => {
	for (const key of Object.keys(env)) delete env[key]
	env.ONBOARDING_EMAIL_RENDER_SECRET = RENDER_SECRET
	getRecord.mockReset().mockResolvedValue({ Email: 'ada@example.org' })
	reportError.mockReset().mockResolvedValue()
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('POST /api/onboarding-email: verification link', () => {
	it('signs the link over the row it reads, in both bodies, keeping the id the sender checks for', async () => {
		env.EMAIL_VERIFICATION_SECRET = SECRET
		const response = await render(SIGNUP)
		expect(response.status).toBe(200)
		const { html, text } = (await response.json()) as { html: string; text: string }
		expect(getRecord).toHaveBeenCalledWith(
			'appWPTGqZmUcs3NWu',
			'tblL1icZBhTV1gQ9o',
			`rec${AIRTABLE_ID}`
		)
		// The Airtable sender falls back to its template unless both bodies contain the id.
		expect(html).toContain(AIRTABLE_ID)
		expect(text).toContain(AIRTABLE_ID)
		for (const body of [html, text]) {
			const links = linksIn(body)
			expect(links.length).toBeGreaterThan(0)
			for (const link of links) {
				expect(link.searchParams.get('verificationKey')).toBe(AIRTABLE_ID)
				const token = link.searchParams.get('token') ?? ''
				expect(
					await verifyVerificationToken(
						SECRET,
						`rec${AIRTABLE_ID}`,
						'ada@example.org',
						token,
						Date.now()
					)
				).toBe('valid')
			}
		}
	})

	it('refuses an id that is not alphanumeric', async () => {
		const response = await render({ ...SIGNUP, airtable_id: '../x' })
		expect(response.status).toBe(400)
		expect(getRecord).not.toHaveBeenCalled()
	})
})
