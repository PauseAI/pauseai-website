import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const groups = [
	{
		name: 'Sweden',
		website: 'pauseai.se',
		whatsappLink: 'https://chat.whatsapp.com/x(y)z',
		// A URL is free text: it can carry markdown of its own, or characters that a naive
		// string replacement would read as instructions.
		lumaLink: "https://luma.com/**a**$'b",
		discordLink: 'javascript:alert(1)',
		facebookLink: ' https://www.facebook.com/groups/1/ '
	},
	{ name: 'United States', website: 'https://pauseai-us.org/' }
]

const getNationalGroups = vi.fn<() => Promise<unknown[] | null>>()
const nationalGroupsReportsSent = vi.fn<() => Promise<void>>()
vi.mock('$lib/server/nationalGroups', () => ({ getNationalGroups, nationalGroupsReportsSent }))

const {
	CHAPTER_READ_TIMEOUT_MS,
	getChapterForOnboardingEmail,
	listActiveChapterCountries,
	lookupChapterForOnboardingEmail
} = await import('./chapter.js')

beforeEach(() => {
	getNationalGroups.mockReset().mockResolvedValue(groups)
	nationalGroupsReportsSent.mockReset().mockResolvedValue()
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
	vi.useRealTimers()
	vi.restoreAllMocks()
})

describe('getChapterForOnboardingEmail', () => {
	it('takes the links a row has and leaves out what is not a web link', async () => {
		const chapter = await getChapterForOnboardingEmail('sweden')
		expect(chapter?.name).toBe('Sweden')
		const byLabel = Object.fromEntries(chapter!.links.map((link) => [link.label, link.url]))
		// Typed without a scheme, and with brackets that would otherwise end the markdown link.
		expect(byLabel.Website).toBe('https://pauseai.se')
		expect(byLabel.WhatsApp).toBe('https://chat.whatsapp.com/x%28y%29z')
		expect(byLabel.Facebook).toBe('https://www.facebook.com/groups/1/')
		expect(byLabel.Events).toBe("https://luma.com/**a**$'b")
		expect(byLabel.Discord).toBeUndefined()
	})

	it('renders without a chapter rather than failing the send when no list can be read', async () => {
		getNationalGroups.mockResolvedValue(null)
		expect(await getChapterForOnboardingEmail('Sweden')).toBeNull()
		await expect(lookupChapterForOnboardingEmail('Sweden')).rejects.toThrow()
	})

	it('gives up on a slow chapter list, leaving its read running', async () => {
		vi.useFakeTimers()
		getNationalGroups.mockReturnValue(new Promise(() => {}))
		const lookup = lookupChapterForOnboardingEmail('Sweden')
		const settled = vi.fn()
		lookup.then(settled, settled)
		await vi.advanceTimersByTimeAsync(CHAPTER_READ_TIMEOUT_MS - 1)
		expect(settled).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(1)
		await expect(lookup).rejects.toThrow(`${CHAPTER_READ_TIMEOUT_MS} ms`)
		expect(vi.getTimerCount()).toBe(0)
	})

	it('hands a read cut short, and the sending of its report, to waitUntil, and only then', async () => {
		const waitUntil = vi.fn<(promise: Promise<unknown>) => void>()
		await lookupChapterForOnboardingEmail('Sweden', waitUntil)
		expect(waitUntil).not.toHaveBeenCalled()

		vi.useFakeTimers()
		let finishRead: (groups: null) => void = () => {}
		getNationalGroups.mockReturnValue(new Promise((resolve) => (finishRead = resolve)))
		let sendReports: () => void = () => {}
		nationalGroupsReportsSent.mockReturnValue(new Promise((resolve) => (sendReports = resolve)))
		const lookup = lookupChapterForOnboardingEmail('Sweden', waitUntil)
		lookup.catch(() => {})
		await vi.advanceTimersByTimeAsync(CHAPTER_READ_TIMEOUT_MS)
		await expect(lookup).rejects.toThrow()
		expect(waitUntil).toHaveBeenCalledOnce()

		const settled = vi.fn()
		void waitUntil.mock.calls[0][0].then(settled)
		finishRead(null)
		await vi.advanceTimersByTimeAsync(0)
		expect(settled).not.toHaveBeenCalled()
		sendReports()
		await vi.advanceTimersByTimeAsync(0)
		expect(settled).toHaveBeenCalledOnce()
	})

	it('still gives up on time when waitUntil throws', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.useFakeTimers()
		getNationalGroups.mockReturnValue(new Promise(() => {}))
		const lookup = lookupChapterForOnboardingEmail('Sweden', () => {
			throw new TypeError('no context')
		})
		const settled = vi.fn()
		lookup.then(settled, settled)
		await vi.advanceTimersByTimeAsync(CHAPTER_READ_TIMEOUT_MS)
		await expect(lookup).rejects.toThrow(`${CHAPTER_READ_TIMEOUT_MS} ms`)
		expect(console.warn).toHaveBeenCalledWith(expect.any(String), 'TypeError')
	})

	it('has no chapter for a country PauseAI Global does not onboard', async () => {
		expect(await getChapterForOnboardingEmail('United States')).toBeNull()
		expect(getNationalGroups).not.toHaveBeenCalled()
	})
})

describe('listActiveChapterCountries', () => {
	it('lists the chapters PauseAI Global onboards, and none when no list can be read', async () => {
		expect(await listActiveChapterCountries()).toEqual(['Sweden'])
		getNationalGroups.mockResolvedValue(null)
		expect(await listActiveChapterCountries()).toEqual([])
	})
})
