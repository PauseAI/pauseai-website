import Headers, { CacheControl, type CacheControlInit } from '@remix-run/headers'

type DateStyle = Intl.DateTimeFormatOptions['dateStyle']

export function formatDate(date: string, dateStyle: DateStyle = 'medium', locales = 'en') {
	const formatter = new Intl.DateTimeFormat(locales, { dateStyle })
	return formatter.format(new Date(date))
}

export function typedEntries<T extends Parameters<typeof Object.entries>[0]>(obj: T) {
	return Object.entries(obj) as [Extract<keyof T, string>, T[keyof T]][]
}

export function generateCacheControlRecord(options: CacheControlInit): Record<string, string> {
	const headers = new Headers({ cacheControl: new CacheControl(options) })
	return headersToRecord(headers)
}

export function headersToRecord(headers: Headers): Record<string, string> {
	return Object.fromEntries(headers.entries())
}
