import { getLocale } from '$lib/paraglide/runtime'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ depends }) => {
	depends('paraglide:lang')
	const locale = getLocale()
	const { default: intro } = await importIntro(locale)
	const { default: afterDonors } = await importAfterDonors(locale)

	return {
		intro,
		afterDonors
	}
}

async function importIntro(locale: string) {
	if (locale === 'en') {
		return await import('./intro.md')
	}
	try {
		return await import(`../../../l10n-cage/md/${locale}/funding-intro.md`)
	} catch {
		return await import('./intro.md')
	}
}

async function importAfterDonors(locale: string) {
	if (locale === 'en') {
		return await import('./afterDonors.md')
	}
	try {
		return await import(`../../../l10n-cage/md/${locale}/funding-afterDonors.md`)
	} catch {
		return await import('./afterDonors.md')
	}
}
