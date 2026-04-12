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
		// @ts-expect-error mdsvex files are not correctly typed in the local env
		return (await import('./intro.md')) as { default: import('svelte').Component }
	}
	try {
		return (await import(`../../../l10n-cage/md/${locale}/funding-intro.md`)) as {
			default: import('svelte').Component
		}
	} catch {
		// @ts-expect-error mdsvex files are not correctly typed in the local env
		return (await import('./intro.md')) as { default: import('svelte').Component }
	}
}

async function importAfterDonors(locale: string) {
	if (locale === 'en') {
		// @ts-expect-error mdsvex files are not correctly typed in the local env
		return (await import('./afterDonors.md')) as { default: import('svelte').Component }
	}
	try {
		return (await import(`../../../l10n-cage/md/${locale}/funding-afterDonors.md`)) as {
			default: import('svelte').Component
		}
	} catch {
		// @ts-expect-error mdsvex files are not correctly typed in the local env
		return (await import('./afterDonors.md')) as { default: import('svelte').Component }
	}
}
