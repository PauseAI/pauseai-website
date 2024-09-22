export type Language = {
	code: string
	name: string
	dictionary?: Record<string, string>
}

export const languages = [
	{
		code: 'en',
		name: 'English'
	},
	{
		code: 'nl',
		name: 'Dutch / Nederlands',
		dictionary: {
			'x-risk': 'existentieel risico'
		}
	}
]
