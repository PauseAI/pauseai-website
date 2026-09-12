import type { BaseLanguage } from './types.js'

// Mirrors the Spanish-speaking country list in airtable-mailersend-emails.js exactly, so
// language routing doesn't drift between the render endpoint and the fallback templates.
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

// A multipleSelects field arrives as an array; a lookup or single-line mapping arrives
// comma-joined, so split before matching, as the live script does.
function normalizeLanguages(languages: string[] | string | undefined): string[] {
	const list = Array.isArray(languages) ? languages : languages ? [String(languages)] : []
	return list.flatMap((entry) =>
		String(entry)
			.split(',')
			.map((part) => part.trim().toLowerCase())
			.filter(Boolean)
	)
}

/**
 * Resolves which language the shared copy goes out in, matching the live script's routing:
 *  - any selected language starting with "español"/"spanish" -> es
 *  - country in the Spanish-speaking list -> es
 *  - everything else -> en
 * French is not offered yet: the live script's only French route (Canada plus French in
 * `languages`) has never matched, and French for France waits for that chapter's review.
 */
export function resolveOnboardingEmailLanguage(
	country: string | undefined,
	languages: string[] | string | undefined
): BaseLanguage {
	const langLower = normalizeLanguages(languages)
	const cleanCountry = (country ?? '').trim()

	if (langLower.some((l) => l.startsWith('español') || l.startsWith('spanish'))) {
		return 'es'
	}

	if (cleanCountry && SPANISH_COUNTRIES.has(cleanCountry)) {
		return 'es'
	}

	return 'en'
}
