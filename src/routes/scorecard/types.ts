export type Company = {
	name: string
	title?: string
	acknowledge: Score
	lobby: Score
	deployment: Score
}

export type Score = {
	explanation: string
	/** 0 - 10*/
	score: number
}

export type catagoryTypes = 'acknowledge' | 'lobby' | 'deployment'

export type Category = {
	name: string
	key: catagoryTypes
	explanation: string
}
