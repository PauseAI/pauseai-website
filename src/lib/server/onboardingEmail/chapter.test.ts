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
vi.mock('$lib/server/nationalGroups', () => ({ getNationalGroups }))

const {
	CHAPTER_READ_TIMEOUT_MS,
	getChapterForOnboardingEmail,
	listActiveChapterCountries,
	lookupChapterForOnboardingEmail
} = await import('./chapter.js')

beforeEach(() => {
	getNationalGroups.mockReset().mockResolvedValue(groups)
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

	it('hands a read cut short to waitUntil, and only then', async () => {
		const waitUntil = vi.fn()
		await lookupChapterForOnboardingEmail('Sweden', waitUntil)
		expect(waitUntil).not.toHaveBeenCalled()

		vi.useFakeTimers()
		const read = new Promise<null>(() => {})
		getNationalGroups.mockReturnValue(read)
		const lookup = lookupChapterForOnboardingEmail('Sweden', waitUntil)
		lookup.catch(() => {})
		await vi.advanceTimersByTimeAsync(CHAPTER_READ_TIMEOUT_MS)
		await expect(lookup).rejects.toThrow()
		expect(waitUntil).toHaveBeenCalledExactlyOnceWith(read)
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
