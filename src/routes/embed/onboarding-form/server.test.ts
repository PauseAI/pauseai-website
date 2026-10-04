import type { WrittenRecord as Written } from '$lib/airtable'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const env: Record<string, string | undefined> = {}
const createRecord = vi.fn<(...args: unknown[]) => Promise<Written | undefined>>()
const updateRecord = vi.fn<(...args: unknown[]) => Promise<Written | 'missing' | 'failed'>>()
const getRecord =
	vi.fn<(...args: unknown[]) => Promise<Record<string, unknown> | 'missing' | 'failed'>>()
const reportError =
	vi.fn<(error: unknown, context?: Record<string, unknown>, options?: unknown) => Promise<void>>()

vi.mock('$env/dynamic/private', () => ({ env }))
vi.mock('$lib/airtable', () => ({ createRecord, getRecord, updateRecord }))
vi.mock('$lib/server/turnstile-verify', () => ({
	checkNotSpam: () => Promise.resolve({ drop: false })
}))
vi.mock('$lib/server/substack', () => ({ subscribeToSubstackNewsletter: vi.fn() }))
vi.mock('$lib/server/sentry', () => ({ reportError, flushReports: () => Promise.resolve() }))
// The National Chapters list the action reads (null: never read on this instance).
let nationalGroups: { name: string; leader: string }[] | null
vi.mock('$lib/server/nationalGroups', () => ({
	getNationalGroups: () => Promise.resolve(nationalGroups)
}))

const { actions } = await import('./+page.server.js')
const { TOKEN_TTL_SECONDS } = await import('$lib/server/onboardingContinuation')
const { chapterQuestion, chapterShareWording } =
	await import('$lib/components/onboarding/chapterShare')
const { onboardingMessages } = await import('$lib/components/onboarding/messages')

// What Airtable answers a write with: the whole row, so an update returns more
// than it sent.
const written = (id: string, fields: Written['fields'] = {}): Written => ({
	id,
	createdTime: '2026-10-04T12:00:00.000Z',
	fields: { Email: 'ada@example.org', ...fields }
})
const mockWrites = () => {
	createRecord
		.mockReset()
		.mockImplementation((_base, _table, fields) =>
			Promise.resolve(written('recAda', fields as Written['fields']))
		)
	updateRecord
		.mockReset()
		.mockImplementation((_base, _table, id, fields) =>
			Promise.resolve(written(id as string, fields as Written['fields']))
		)
}

type Result = { status?: number; data?: Record<string, unknown> } & Record<string, unknown>

// What /api/national-groups answers, which both the forms and the action read.
const CHAPTERS = ['France', 'Germany', 'United Kingdom'].map((name) => ({ name, leader: 'Lead' }))

async function submit(fields: Record<string, string>, platform?: unknown): Promise<Result> {
	const body = new FormData()
	for (const [name, value] of Object.entries(fields)) body.set(name, value)
	const url = new URL('https://pauseai.info/embed/onboarding-form?/submit')
	const request = new Request(url, { method: 'POST', body })
	return (await actions.submit({ request, url, fetch, platform } as never)) as Result
}

// The wording the form renders, built the way the form builds it.
function wording(
	form: 'join' | 'subscribe',
	country: string,
	chapter: string | null,
	answer: 'yes' | 'no',
	locale = 'en'
): string {
	return chapterShareWording(
		chapterQuestion(onboardingMessages[locale], form, country, chapter)!,
		answer
	)
}

const WORDING_YES_DE = wording('join', 'Germany', 'PauseAI Deutschland', 'yes')
const WORDING_YES_PT = wording('join', 'Portugal', null, 'yes')
const WORDING_UK = wording('join', 'United Kingdom', 'PauseAI UK', 'no')

// A stored Members row's chapter fields, as getRecord returns them.
const row = (Country: string, permission: boolean, chapterWording: string) => ({
	Country,
	'GDPR chapter share permission': permission,
	'GDPR chapter share wording': chapterWording
})
const UK_ROW = row('United Kingdom', false, WORDING_UK)

const signup = {
	full_name: 'Ada Lovelace',
	email: 'ada@example.org',
	country: 'United Kingdom',
	city: 'London',
	intent: 'None',
	agree_gdpr: 'on',
	chapter_share: 'no',
	chapter_share_wording: WORDING_UK
}

const SESSION_EXPIRED = 'Your signup session has expired. Please fill in the form again.'

const update = (recordToken?: string) => ({
	email: 'ada@example.org',
	intent: 'Act now',
	record_id: 'recAda',
	...(recordToken === undefined ? {} : { record_token: recordToken })
})

describe('onboarding submit: continuation token', () => {
	beforeEach(() => {
		for (const key of Object.keys(env)) delete env[key]
		env.ONBOARDING_LIVE = 'true'
		env.ONBOARDING_CONTINUATION_SECRET = 'test-secret'
		mockWrites()
		getRecord.mockReset().mockResolvedValue(UK_ROW)
		nationalGroups = CHAPTERS
		reportError.mockClear()
		vi.spyOn(console, 'warn').mockImplementation(() => {})
	})
	afterEach(() => vi.useRealTimers())

	it('returns a token with a create, and a fresh one with an update that posts it', async () => {
		const created = await submit(signup)
		expect(created).toMatchObject({ success: true, recordId: 'recAda' })
		expect(created.recordToken).toMatch(/^v1\./)

		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		const updated = await submit(update(String(created.recordToken)))
		expect(updated).toMatchObject({ success: true, recordId: 'recAda' })
		expect(updated.recordToken).toMatch(/^v1\./)
		expect(updateRecord).toHaveBeenCalledOnce()
		expect(reportError).not.toHaveBeenCalled()
	})

	it('writes and reports an update without a valid token while not enforcing, issuing none', async () => {
		for (const token of [undefined, 'v1.9999999999.' + 'A'.repeat(43)]) {
			const updated = await submit(update(token))
			expect(updated).toMatchObject({ success: true, recordId: 'recAda' })
			expect(updated.recordToken).toBeUndefined()
		}
		expect(updateRecord).toHaveBeenCalledTimes(2)
		expect(reportError).toHaveBeenCalledTimes(2)
	})

	it('issues no token on an update when the secret is missing', async () => {
		delete env.ONBOARDING_CONTINUATION_SECRET
		vi.spyOn(console, 'error').mockImplementation(() => {})
		const updated = await submit(update())
		expect(updated).toMatchObject({ success: true, recordId: 'recAda' })
		expect(updated.recordToken).toBeUndefined()
	})

	it('refuses an update with a missing or forged token as gone when enforcing, creating nothing', async () => {
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		const created = await submit(signup)
		createRecord.mockClear()
		for (const token of [undefined, 'v1.9999999999.' + 'A'.repeat(43)]) {
			const refused = await submit(update(token))
			expect(refused.status).toBe(410)
			expect(refused.data?.message).toBe(SESSION_EXPIRED)
		}
		const otherRow = await submit({ ...update(String(created.recordToken)), record_id: 'recGrace' })
		expect(otherRow.status).toBe(410)
		expect(otherRow.data?.message).toBe(SESSION_EXPIRED)
		expect(updateRecord).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('refuses an expired token when enforcing', async () => {
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(new Date('2026-10-01T12:00:00Z'))
		const created = await submit(signup)
		vi.setSystemTime(Date.now() + TOKEN_TTL_SECONDS * 1000)
		const refused = await submit(update(String(created.recordToken)))
		expect(refused.status).toBe(410)
		expect(refused.data?.message).toBe(SESSION_EXPIRED)
		expect(updateRecord).not.toHaveBeenCalled()
		expect(reportError.mock.calls[0][1]).toMatchObject({ verdict: 'expired' })
	})

	it('refuses a resumed signup with a bad token when enforcing, creating nothing', async () => {
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		const refused = await submit({ ...signup, ...update('garbage'), resumed: '1' })
		expect(refused.status).toBe(410)
		expect(refused.data?.message).toBe(SESSION_EXPIRED)
		expect(updateRecord).not.toHaveBeenCalled()
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('issues and checks tokens in stub mode too', async () => {
		delete env.ONBOARDING_LIVE
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		vi.spyOn(console, 'error').mockImplementation(() => {})
		const created = await submit(signup)
		expect(created.recordId).toMatch(/^stub-/)
		expect(created.recordToken).toMatch(/^v1\./)
		const stubUpdate = {
			...update(String(created.recordToken)),
			record_id: String(created.recordId)
		}
		const updated = await submit(stubUpdate)
		expect(updated).toMatchObject({ success: true, recordId: created.recordId })
		expect(updated.recordToken).toMatch(/^v1\./)
		const refused = await submit({ ...stubUpdate, record_token: 'garbage' })
		expect(refused.status).toBe(410)
		expect(refused.data?.message).toBe(SESSION_EXPIRED)
		expect(createRecord).not.toHaveBeenCalled()
		expect(updateRecord).not.toHaveBeenCalled()
	})

	it('keeps its own message for a row that is gone', async () => {
		updateRecord.mockResolvedValue('missing')
		const created = await submit(signup)
		const gone = await submit(update(String(created.recordToken)))
		expect(gone.status).toBe(410)
		expect(gone.data?.message).toBe(
			'We could not find your earlier signup. Please go through the form again.'
		)
	})
})

const CHAPTER_ANSWER_MISSING =
	'Please answer whether to share your details with a PauseAI chapter. If you cannot see the question, reload the page.'

const usSignup = {
	full_name: 'Grace Hopper',
	email: 'grace@example.org',
	country: 'United States',
	city: 'New York',
	intent: 'None',
	agree_gdpr: 'on'
}

function writtenFields(mock: typeof createRecord | typeof updateRecord): Record<string, unknown> {
	const call = mock.mock.calls.at(-1)
	expect(call).toBeDefined()
	return call![call!.length - 1] as Record<string, unknown>
}

const CHAPTER_FIELDS = ['GDPR chapter share permission', 'GDPR chapter share wording']
const CLEARED = { 'GDPR chapter share permission': false, 'GDPR chapter share wording': '' }

describe('onboarding submit: chapter sharing', () => {
	beforeEach(() => {
		for (const key of Object.keys(env)) delete env[key]
		env.ONBOARDING_LIVE = 'true'
		env.ONBOARDING_CONTINUATION_SECRET = 'test-secret'
		mockWrites()
		getRecord.mockReset().mockResolvedValue(UK_ROW)
		nationalGroups = CHAPTERS
		reportError.mockClear()
		vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	it('refuses a create outside the US without an answer, writing nothing', async () => {
		for (const missing of [
			{ chapter_share: '' },
			{ chapter_share: 'on' },
			{ chapter_share_wording: '' }
		]) {
			const forms: Record<string, string>[] = [
				{},
				{ subscribe_form: '1' },
				{ mode: 'browse', intent: 'Act now' }
			]
			for (const form of forms) {
				const refused = await submit({ ...signup, ...form, ...missing })
				expect(refused.status).toBe(400)
				expect(refused.data?.message).toBe(CHAPTER_ANSWER_MISSING)
			}
		}
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('refuses a wording other than the one the form renders for the answer and country', async () => {
		const germany = { ...signup, country: 'Germany', city: 'Berlin' }
		for (const [fields, answer, posted] of [
			[signup, 'yes', WORDING_UK],
			[signup, 'no', WORDING_YES_DE],
			[signup, 'no', 'No, only PauseAI Global'],
			[germany, 'yes', `${WORDING_YES_DE}\nextra line`],
			// Another country's wording.
			[signup, 'yes', WORDING_YES_DE],
			// A fabricated question ending in an option the form offers.
			[
				germany,
				'yes',
				'Can we sell your details?\nWe will.\n[chosen] Yes, share my details with PauseAI Deutschland'
			],
			[signup, 'no', 'Anything at all\n[chosen] No, only PauseAI Global'],
			// Another chapter's name in an otherwise real wording.
			[germany, 'yes', wording('join', 'Germany', 'PauseAI Evil', 'yes')],
			// /subscribe's wording posted by /join.
			[germany, 'yes', wording('subscribe', 'Germany', 'PauseAI Deutschland', 'yes')]
		] as const) {
			const refused = await submit({
				...fields,
				chapter_share: answer,
				chapter_share_wording: posted
			})
			expect(refused.status, posted).toBe(400)
			expect(refused.data?.message).toBe(CHAPTER_ANSWER_MISSING)
		}
		expect(createRecord).not.toHaveBeenCalled()
	})

	it('accepts the wording in any locale, with CRLF line breaks, or as the no-chapter variant', async () => {
		for (const posted of [
			wording('join', 'United Kingdom', 'PauseAI UK', 'no', 'de'),
			WORDING_UK.replace(/\n/g, '\r\n'),
			// Shown when the form's own chapter lookup failed.
			wording('join', 'United Kingdom', null, 'no', 'fr')
		]) {
			const created = await submit({
				...signup,
				chapter_share: 'no',
				chapter_share_wording: posted
			})
			expect(created).toMatchObject({ success: true })
			expect(writtenFields(createRecord)['GDPR chapter share wording']).toBe(
				posted.replace(/\r\n/g, '\n')
			)
		}
	})

	it('checks a posted wording without the chapter list, so a form on an older list is not refused', async () => {
		// The form's list had a chapter for Italy; the server's has none, or none at all.
		for (const groups of [CHAPTERS, null]) {
			nationalGroups = groups
			for (const answer of ['yes', 'no'] as const) {
				const posted = wording('join', 'Italy', 'PauseAI Italy', answer)
				const created = await submit({
					...signup,
					country: 'Italy',
					city: 'Rome',
					chapter_share: answer,
					chapter_share_wording: posted
				})
				expect(created).toMatchObject({ success: true })
				expect(writtenFields(createRecord)['GDPR chapter share wording']).toBe(posted)
			}
		}
		// And the other way round: Germany is listed, the form showed no chapter.
		const created = await submit({
			...signup,
			country: 'Germany',
			chapter_share: 'yes',
			chapter_share_wording: wording('join', 'Germany', null, 'yes')
		})
		expect(created).toMatchObject({ success: true })
	})

	it('writes the box and the wording from a Yes or a No, in the same create', async () => {
		await submit({
			...signup,
			country: 'Germany',
			chapter_share: 'yes',
			chapter_share_wording: WORDING_YES_DE
		})
		expect(createRecord).toHaveBeenCalledOnce()
		expect(writtenFields(createRecord)).toMatchObject({
			'GDPR chapter share permission': true,
			'GDPR chapter share wording': WORDING_YES_DE
		})

		await submit(signup)
		expect(writtenFields(createRecord)).toMatchObject({
			'GDPR chapter share permission': false,
			'GDPR chapter share wording': WORDING_UK
		})
	})

	it('clears the chapter fields for a US signup, even if an answer is posted', async () => {
		const extras: Record<string, string>[] = [
			{},
			{ chapter_share: 'yes', chapter_share_wording: WORDING_YES_DE }
		]
		for (const extra of extras) {
			const created = await submit({ ...usSignup, ...extra })
			expect(created).toMatchObject({ success: true })
			expect(writtenFields(createRecord)).toMatchObject(CLEARED)
		}
	})

	it('clears an answer given for Germany when the signup is resubmitted as US', async () => {
		const germany = {
			...signup,
			country: 'Germany',
			city: 'Berlin',
			chapter_share: 'yes',
			chapter_share_wording: WORDING_YES_DE
		}
		const created = await submit(germany)
		expect(writtenFields(createRecord)['GDPR chapter share permission']).toBe(true)
		const unasked: Record<string, string> = { ...germany }
		delete unasked.chapter_share
		delete unasked.chapter_share_wording
		await submit({
			...unasked,
			...update(String(created.recordToken)),
			country: 'United States',
			city: 'Boston'
		})
		expect(writtenFields(updateRecord)).toMatchObject({ Country: 'United States', ...CLEARED })
	})

	it('no longer forces sharing on for Volunteer or Lead', async () => {
		for (const intent of ['Volunteer', 'Lead']) {
			await submit({ ...signup, intent })
			expect(writtenFields(createRecord)['GDPR chapter share permission']).toBe(false)
		}
		const created = await submit(signup)
		for (const intent of ['Volunteer', 'Lead', 'None']) {
			await submit({
				...update(String(created.recordToken)),
				intent,
				country: 'United Kingdom',
				subscribe_form: '1'
			})
			const fields = writtenFields(updateRecord)
			for (const field of CHAPTER_FIELDS) expect(fields).not.toHaveProperty(field)
		}
	})

	it('posts no chapter fields on an update without an answer for a row answered for that country', async () => {
		const created = await submit(signup)
		const token = String(created.recordToken)
		// The /subscribe "do more" step: /join's form, a /subscribe answer.
		getRecord.mockResolvedValueOnce(
			row('Germany', true, wording('subscribe', 'Germany', 'PauseAI Deutschland', 'yes'))
		)
		await submit({ ...update(token), intent: 'Volunteer', country: 'Germany' })
		// A /join resume of a row that already has an answer, in another language.
		getRecord.mockResolvedValueOnce(
			row('United Kingdom', false, wording('join', 'United Kingdom', 'PauseAI UK', 'no', 'es'))
		)
		const unasked: Record<string, string> = { ...signup }
		delete unasked.chapter_share
		delete unasked.chapter_share_wording
		await submit({ ...unasked, ...update(token), resumed: '1' })
		// An update posting no country, for the row's own.
		await submit(update(token))
		expect(updateRecord).toHaveBeenCalledTimes(3)
		for (const call of updateRecord.mock.calls) {
			const fields = call[call.length - 1] as Record<string, unknown>
			for (const field of CHAPTER_FIELDS) expect(fields).not.toHaveProperty(field)
		}
	})

	it('refuses an update without an answer for a country the row was not asked about', async () => {
		const created = await submit(signup)
		const token = String(created.recordToken)
		const resumedFrance = {
			...update(token),
			country: 'France',
			resumed: '1',
			agree_gdpr: 'on'
		}
		const unasked = [
			// A US row, never asked, resumed for France.
			row('United States', false, ''),
			// A row from before the question.
			row('France', false, ''),
			// Germany's Yes, now in France.
			row('Germany', true, WORDING_YES_DE)
		]
		for (const stored of unasked) {
			getRecord.mockResolvedValueOnce(stored)
			const refused = await submit(resumedFrance)
			expect(refused.status, JSON.stringify(stored)).toBe(400)
			// Sends the form back to the question.
			expect(refused.data).toEqual({ message: CHAPTER_ANSWER_MISSING, chapterAnswerMissing: true })
		}
		// The volunteer step after the country was changed without an answer.
		getRecord.mockResolvedValueOnce(row('Germany', true, WORDING_YES_DE))
		const volunteer = await submit({ ...update(token), country: 'France', intent: 'Volunteer' })
		expect(volunteer.status).toBe(400)
		expect(updateRecord).not.toHaveBeenCalled()
	})

	it("keeps a stored answer for the row's own country through copy and chapter changes", async () => {
		const created = await submit(signup)
		const token = String(created.recordToken)
		const stillAnswered = [
			// Copy edited since, or edited by staff.
			row('France', false, 'Share your details with PauseAI France?\nOlder copy.\n[chosen] No'),
			// A chapter renamed or deactivated since.
			row('France', true, wording('join', 'France', 'PauseAI Ancien', 'yes')),
			// The country's case differs.
			row('france', true, wording('join', 'France', 'PauseAI France', 'yes'))
		]
		for (const stored of stillAnswered) {
			getRecord.mockResolvedValueOnce(stored)
			const updated = await submit({ ...update(token), country: 'France', intent: 'Volunteer' })
			expect(updated, JSON.stringify(stored)).toMatchObject({ success: true })
			const fields = writtenFields(updateRecord)
			for (const field of CHAPTER_FIELDS) expect(fields).not.toHaveProperty(field)
		}
		// No chapter list needed to keep one.
		nationalGroups = null
		getRecord.mockResolvedValueOnce(stillAnswered[0])
		expect(await submit({ ...update(token), country: 'France' })).toMatchObject({ success: true })
	})

	it('reads the row only when the post leaves the answer to it', async () => {
		const created = await submit(signup)
		const token = String(created.recordToken)
		// The post's country and answer decide: no read.
		await submit({ ...update(token), ...signup, resumed: '1' })
		await submit({ ...update(token), country: 'United States' })
		expect(getRecord).not.toHaveBeenCalled()
		// Without an answer, or without a country, the row decides.
		await submit({ ...update(token), country: 'United Kingdom' })
		await submit(update(token))
		expect(getRecord).toHaveBeenCalledTimes(2)
		expect(updateRecord).toHaveBeenCalledTimes(4)
	})

	it("checks an update that posts no country against the row's country", async () => {
		const created = await submit(signup)
		const token = String(created.recordToken)
		// A US row: any posted answer is dropped and both fields cleared.
		getRecord.mockResolvedValueOnce(row('United States', false, ''))
		await submit({ ...update(token), chapter_share: 'yes', chapter_share_wording: WORDING_YES_DE })
		expect(writtenFields(updateRecord)).toMatchObject(CLEARED)
		expect(writtenFields(updateRecord)).not.toHaveProperty('Country')
		// A Germany row: the answer must be Germany's.
		getRecord.mockResolvedValueOnce(row('Germany', false, ''))
		const refused = await submit({
			...update(token),
			chapter_share: 'yes',
			chapter_share_wording: WORDING_UK
		})
		expect(refused.status).toBe(400)
		getRecord.mockResolvedValueOnce(row('Germany', false, ''))
		await submit({ ...update(token), chapter_share: 'yes', chapter_share_wording: WORDING_YES_DE })
		expect(writtenFields(updateRecord)).toMatchObject({
			'GDPR chapter share permission': true,
			'GDPR chapter share wording': WORDING_YES_DE
		})
		expect(updateRecord).toHaveBeenCalledTimes(2)
	})

	it('treats a row it cannot read as gone, or as an outage', async () => {
		const created = await submit(signup)
		getRecord.mockResolvedValueOnce('missing')
		const gone = await submit(update(String(created.recordToken)))
		expect(gone.status).toBe(410)
		getRecord.mockResolvedValueOnce('failed')
		const failed = await submit(update(String(created.recordToken)))
		expect(failed.status).toBe(502)
		expect(updateRecord).not.toHaveBeenCalled()
	})

	it('writes an answer posted on an update that showed the question', async () => {
		const created = await submit(signup)
		await submit({
			...update(String(created.recordToken)),
			country: 'Portugal',
			resumed: '1',
			agree_gdpr: 'on',
			chapter_share: 'yes',
			chapter_share_wording: WORDING_YES_PT
		})
		expect(writtenFields(updateRecord)).toMatchObject({
			'GDPR chapter share permission': true,
			'GDPR chapter share wording': WORDING_YES_PT
		})
	})

	it('stamps the Signup source per form and country, on a create only', async () => {
		const cases: [Record<string, string>, string][] = [
			[signup, 'October 2026 onboarding flow'],
			[{ ...signup, mode: 'browse', intent: 'Act now' }, 'October 2026 onboarding flow'],
			[
				{
					...signup,
					subscribe_form: '1',
					chapter_share_wording: wording('subscribe', 'United Kingdom', 'PauseAI UK', 'no')
				},
				'October 2026 subscribe form'
			],
			[usSignup, 'October 2026 onboarding flow (US)'],
			[{ ...usSignup, mode: 'browse', intent: 'Act now' }, 'October 2026 onboarding flow (US)'],
			[{ ...usSignup, subscribe_form: '1' }, 'October 2026 subscribe form (US)']
		]
		for (const [fields, source] of cases) {
			await submit(fields)
			expect(writtenFields(createRecord)['Signup source']).toBe(source)
		}
		const created = await submit(signup)
		await submit({ ...update(String(created.recordToken)), subscribe_form: '1' })
		expect(writtenFields(updateRecord)).not.toHaveProperty('Signup source')
	})
})

describe('onboarding submit: CRM intake', () => {
	const crmFetch = vi.fn<typeof fetch>()
	const waitUntil = vi.fn<(promise: Promise<unknown>) => void>()
	const platform = { context: { waitUntil } }
	// What each queued CRM call posted, once every one has settled.
	const crmCalls = async () => {
		await Promise.all(waitUntil.mock.calls.map(([promise]) => promise))
		return crmFetch.mock.calls.map(
			([, init]) => JSON.parse((init!.body as URLSearchParams).get('params')!) as unknown
		)
	}
	const crmAnswers = (body: unknown, status = 200) =>
		crmFetch.mockImplementation(() =>
			Promise.resolve(new Response(JSON.stringify(body), { status }))
		)

	beforeEach(() => {
		for (const key of Object.keys(env)) delete env[key]
		env.ONBOARDING_LIVE = 'true'
		env.ONBOARDING_CONTINUATION_SECRET = 'test-secret'
		env.ONBOARDING_CONTINUATION_ENFORCE = 'true'
		env.CRM_INTAKE_ENABLED = 'true'
		env.CRM_INTAKE_URL = 'https://crm.example.org'
		env.CRM_INTAKE_KEY = 'test-key'
		mockWrites()
		getRecord.mockReset().mockResolvedValue(UK_ROW)
		nationalGroups = CHAPTERS
		reportError.mockClear()
		waitUntil.mockReset()
		crmAnswers({ values: [{ status: 'ok', contact_id: 1 }] })
		vi.stubGlobal('fetch', crmFetch)
		vi.spyOn(console, 'log').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
	})
	afterEach(() => vi.unstubAllGlobals())

	it('sends the written record on a create without a token, and the posted token on each update', async () => {
		const created = await submit(signup, platform)
		const token = String(created.recordToken)
		await submit(update(token), platform)
		await submit({ ...update(token), intent: 'Volunteer' }, platform)

		expect(waitUntil).toHaveBeenCalledTimes(3)
		const calls = await crmCalls()
		const result = (mock: typeof createRecord | typeof updateRecord, call: number) =>
			mock.mock.results[call].value as Promise<Written>
		const [create, update1, update2] = await Promise.all([
			result(createRecord, 0),
			result(updateRecord, 0),
			result(updateRecord, 1)
		])
		expect(calls).toEqual([
			{ record: create, token: '' },
			{ record: update1, token },
			{ record: update2, token }
		])
		// The whole row Airtable answered with, not only the fields the post wrote.
		expect(calls[1]).toMatchObject({
			record: { id: 'recAda', fields: { Email: 'ada@example.org' } }
		})
	})

	it('sends the /subscribe create and its continuation', async () => {
		const created = await submit(
			{
				...signup,
				subscribe_form: '1',
				intent: 'Keep informed',
				chapter_share_wording: wording('subscribe', 'United Kingdom', 'PauseAI UK', 'no')
			},
			platform
		)
		expect(created).toMatchObject({ success: true })
		await submit({ ...update(String(created.recordToken)), subscribe_form: '1' }, platform)
		expect((await crmCalls()).map((call) => (call as { token: string }).token)).toEqual([
			'',
			created.recordToken
		])
	})

	it('makes no call while the flag is off, in stub mode, or when Airtable failed', async () => {
		delete env.CRM_INTAKE_ENABLED
		await submit(signup, platform)

		env.CRM_INTAKE_ENABLED = 'true'
		delete env.ONBOARDING_LIVE
		await submit(signup, platform)

		env.ONBOARDING_LIVE = 'true'
		vi.spyOn(console, 'error').mockImplementation(() => {})
		createRecord.mockResolvedValueOnce(undefined)
		expect(await submit(signup, platform)).toMatchObject({ status: 502 })
		updateRecord.mockResolvedValueOnce('failed')
		const token = String((await submit(signup)).recordToken)
		crmFetch.mockClear()
		waitUntil.mockClear()
		expect(await submit(update(token), platform)).toMatchObject({ status: 502 })

		expect(waitUntil).not.toHaveBeenCalled()
		expect(crmFetch).not.toHaveBeenCalled()
	})

	it('answers the signup the same whatever the CRM does, without waiting for it', async () => {
		const strip = (result: Result) => ({ ...result, recordToken: typeof result.recordToken })
		delete env.CRM_INTAKE_ENABLED
		const expected = strip(await submit(signup, platform))
		env.CRM_INTAKE_ENABLED = 'true'

		const outcomes: (() => void)[] = [
			() => crmAnswers({ values: [{ status: 'refused', reason: 'token_required' }] }),
			() => crmAnswers({ error_code: 0, error_message: 'Sorry', status: 500 }, 500),
			() => crmFetch.mockImplementation(() => Promise.reject(new TypeError('fetch failed'))),
			// Never answers: the action must not wait for it.
			() => crmFetch.mockImplementation(() => new Promise(() => {}))
		]
		for (const outcome of outcomes) {
			outcome()
			expect(strip(await submit(signup, platform))).toEqual(expected)
		}
		expect(reportError).not.toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ check: 'onboarding-continuation' })
		)
	})
})
