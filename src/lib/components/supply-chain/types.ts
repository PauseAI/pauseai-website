export interface Node {
	id: string
	label: string
	category: 'equipment' | 'foundry' | 'design' | 'eda_memory' | 'assembly' | 'end'
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
