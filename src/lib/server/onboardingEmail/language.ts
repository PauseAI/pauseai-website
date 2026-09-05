import type { OnboardingEmailLanguage } from './types.js'

// Mirrors the Spanish-speaking country list and Canada/French detection logic in
// airtable-mailersend-emails.js exactly, so language routing doesn't drift between
// the render endpoint and the (fallback) template_id script.
const SPANISH_COUNTRIES = new Set([
	'Argentina',
	'Bolivia',
	'Chile',
	'Colombia',
	'Costa Rica',
	'Cuba',
	'Dominican Republic',
	'Ecuador',
	'El Salvador',
	'Equatorial Guinea',
	'Guatemala',
	'Honduras',
	'Mexico',
	'Nicaragua',
	'Panama',
	'Paraguay',
	'Peru',
	'Spain',
	'Uruguay',
	'Venezuela'
])

function normalizeLanguages(languages: string[] | string | undefined): string[] {
	const list = Array.isArray(languages) ? languages : languages ? [String(languages)] : []
	return list.map((l) => String(l).toLowerCase())
}

/**
 * Resolves which hand-maintained email language to use, primarily from `country`,
 * matching the current airtable-mailersend-emails.js routing:
 *  - any selected language starting with "español"/"spanish" -> es
 *  - country in the Spanish-speaking list -> es
 *  - country is France -> fr
 *  - country is Canada + French explicitly selected in `languages` -> fr
 *  - everything else -> en
 */
export function resolveOnboardingEmailLanguage(
	country: string | undefined,
	languages: string[] | string | undefined
): OnboardingEmailLanguage {
	const langLower = normalizeLanguages(languages)
	const cleanCountry = (country ?? '').trim()

	if (langLower.some((l) => l.startsWith('español') || l.startsWith('spanish'))) {
		return 'es'
	}

	if (cleanCountry && SPANISH_COUNTRIES.has(cleanCountry)) {
		return 'es'
	}

	if (cleanCountry.includes('France')) {
		return 'fr'
	}

	if (cleanCountry.includes('Canada')) {
		const isFrench = langLower.some((l) => l.includes('french') || l.includes('français'))
		if (isFrench) return 'fr'
	}

	return 'en'
}
