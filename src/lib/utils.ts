type DateStyle = Intl.DateTimeFormatOptions['dateStyle']

export function formatDate(date: string, dateStyle: DateStyle = 'medium', locales = 'en') {
	const formatter = new Intl.DateTimeFormat(locales, { dateStyle })
	return formatter.format(new Date(date))
}

import { redirect } from '@sveltejs/kit'

export function handleRedirects(url: URL) {
	const { host, pathname, searchParams } = url

	// Redirect from pauseai.org to pauseai.info
	if (host === 'pauseai.org') {
		throw redirect(301, 'https://pauseai.info' + pathname)
	}

	// Check if the path does not start with a locale
	const localePattern = /^\/(en|nl|fr|es|de|it|pt|ru|zh|ja|ko)\//
	if (!localePattern.test(pathname)) {
		// Redirect to the same path with /en prefix
		throw redirect(307, `/en${pathname}`)
	}

	// Extract the locale from the pathname
	const locale = pathname.split('/')[1] || 'en'
	const lang = searchParams.get('lang') || locale

	return { lang, pathname }
}
