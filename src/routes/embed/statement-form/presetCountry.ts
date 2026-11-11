import { COUNTRIES } from '$lib/components/onboarding/options'

/** The `?country=` to preset, when it names one of the form's countries exactly. */
export function presetCountry(params: URLSearchParams): string {
	const country = params.get('country') ?? ''
	return COUNTRIES.includes(country) ? country : ''
}
