import { getLocale } from '$lib/paraglide/runtime'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ data, depends }) => {
	depends('paraglide:lang')
	const locale = getLocale()
	const { default: intro } = await importIntro(locale)
	const { default: afterDonors } = await importAfterDonors(locale)

	return {
		...data,
		intro,
		afterDonors
	}
}

async function importIntro(locale: string) {
	if (locale === 'en') {
		// @ts-ignore
		return await import('./intro.md')
	}
	try {
		return await import(`../../../l10n-cage/md/${locale}/funding-intro.md`)
	} catch {
		// @ts-ignore
		return await import('./intro.md')
	}
}

async function importAfterDonors(locale: string) {
	if (locale === 'en') {
		// @ts-ignore
		return await import('./afterDonors.md')
	}
	try {
		return await import(`../../../l10n-cage/md/${locale}/funding-afterDonors.md`)
	} catch {
		// @ts-ignore
		return await import('./afterDonors.md')
	}
}
