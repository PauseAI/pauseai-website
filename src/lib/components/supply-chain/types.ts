export interface Node {
	id: string
	label: string
	category: 'litho' | 'fab' | 'design' | 'assembly' | 'end'
	x?: number
	y?: number
}

export interface NodeInfo {
	title: string
	description: string
	details: string[]
}

export interface Edge {
	source: string
	target: string
	links?: string[] | null
	description?: string | null
	weight?: number
}
