type DateStyle = Intl.DateTimeFormatOptions['dateStyle']

export function formatDate(date: string, dateStyle: DateStyle = 'medium', locales = 'en') {
	const formatter = new Intl.DateTimeFormat(locales, { dateStyle })
	return formatter.format(new Date(date))
}

export const defaultTitle = 'Volunteer'

export function typedEntries<T extends Parameters<typeof Object.entries>[0]>(obj: T) {
	return Object.entries(obj) as [keyof T, T[keyof T]][]
}
