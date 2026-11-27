import { describe, expect, it } from 'vitest'
import { getMessages, isOnboardingLocale, setOnboardingLocale } from './i18n.svelte.js'
import { onboardingMessages } from './messages.js'

describe('onboarding locale', () => {
	it('accepts every supported locale, Italian included', () => {
		for (const locale of ['en', 'de', 'fr', 'es', 'it']) {
			expect(isOnboardingLocale(locale), locale).toBe(true)
		}
		setOnboardingLocale('it')
		expect(getMessages()).toBe(onboardingMessages.it)
	})

	it('ignores unknown values, including inherited object keys', () => {
		setOnboardingLocale('en')
		for (const value of ['pt', 'constructor', 'toString', '__proto__', 'hasOwnProperty']) {
			expect(isOnboardingLocale(value), value).toBe(false)
			setOnboardingLocale(value)
			expect(getMessages(), value).toBe(onboardingMessages.en)
		}
	})
})
