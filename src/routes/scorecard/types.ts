export type Company = {
	name: string
	title?: string
	acknowledge: Score
	lobby: Score
	deployment: Score
	research: Score
	totalScore?: number
}

export type Score = {
	explanation: string
	/** 0 - 10*/
	score: number
}

export type catagoryTypes = 'acknowledge' | 'lobby' | 'deployment' | 'research'

export type Category = {
	name: string
	key: catagoryTypes
	explanation: string
}
