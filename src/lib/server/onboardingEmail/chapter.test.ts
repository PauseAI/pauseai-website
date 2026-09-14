import { describe, expect, it, vi } from 'vitest'

const records: { fields: Record<string, unknown> }[] = [
	{
		fields: {
			country: 'Sweden',
			website: 'pauseai.se',
			whatsapp: 'https://chat.whatsapp.com/x(y)z',
			// A URL is free text: it can carry markdown of its own, or characters that a naive
			// string replacement would read as instructions.
			luma: "https://luma.com/**a**$'b",
			discord: 'javascript:alert(1)',
			facebook: ' https://www.facebook.com/groups/1/ '
		}
	}
]

let fetchFails = false

vi.mock('$lib/airtable.js', () => ({
	fetchAllPages: () =>
		fetchFails ? Promise.reject(new Error('Airtable is down')) : Promise.resolve(records)
}))

const { getChapterForOnboardingEmail } = await import('./chapter.js')

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

	it('renders without a chapter rather than failing the send when Airtable is down', async () => {
		fetchFails = true
		try {
			expect(await getChapterForOnboardingEmail('Sweden')).toBeNull()
		} finally {
			fetchFails = false
		}
	})

	it('has no chapter for a country PauseAI Global does not onboard', async () => {
		expect(await getChapterForOnboardingEmail('United States')).toBeNull()
	})
})
