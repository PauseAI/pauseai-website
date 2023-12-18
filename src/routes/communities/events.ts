const calendarlink = (calendarId: string) =>
	`http://www.google.com/calendar/feeds/${calendarId}@group.calendar.google.com/public/full?orderby=starttime&sortorder=ascending&futureevents=true&alt=json`

const PauseAI = 'c_f5a8af206e63587665c6e8303983fefaf3a0c6144db0aa49c970efa510a3d867'

export const calendars = {
	PauseAI: calendarlink(PauseAI)
}
