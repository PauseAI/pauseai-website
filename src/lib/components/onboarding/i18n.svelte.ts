// Temporary localisation module for the onboarding embed.
// Replaces paraglide until the l10n cage (PauseAI/paraglide) is accessible
// and German translations can be compiled into the runtime via `pnpm l10n`.
// To add a new language, add a new locale object to messages.ts.
import { onboardingMessages, type OnboardingMessages } from './messages'

export type OnboardingLocale = keyof typeof onboardingMessages

let locale = $state<OnboardingLocale>('en')

export function setOnboardingLocale(l: string) {
	if (l in onboardingMessages) locale = l
}

export function isOnboardingLocale(s: string): s is OnboardingLocale {
	return s in onboardingMessages
}

export function getMessages(): OnboardingMessages {
	return onboardingMessages[locale]
}
