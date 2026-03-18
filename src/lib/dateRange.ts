type DateRange = {
	startsOn?: string
	endsOn?: string
}

/** Check if the current date falls within a date range (local calendar days, inclusive). */
export function isDateRangeActive({ startsOn, endsOn }: DateRange): boolean {
	const now = new Date()
	if (startsOn) {
		const start = parseLocalStartOfDay(startsOn)
		if (now < start) return false
	}
	if (endsOn) {
		const end = parseLocalEndOfDay(endsOn)
		if (now > end) return false
	}
	return true
}

/** Parse a YYYY-MM-DD string as the start of that day in local time. */
function parseLocalStartOfDay(date: string): Date {
	const [y, m, d] = date.split('-').map(Number)
	return new Date(y, m - 1, d, 0, 0, 0, 0)
}

/** Parse a YYYY-MM-DD string as the end of that day in local time. */
function parseLocalEndOfDay(date: string): Date {
	const [y, m, d] = date.split('-').map(Number)
	return new Date(y, m - 1, d, 23, 59, 59, 999)
}
