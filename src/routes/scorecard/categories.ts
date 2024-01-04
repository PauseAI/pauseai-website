import type { Category } from './types'

export const categories: Category[] = [
	{
		name: 'Acknowledge',
		key: 'acknowledge',
		explanation:
			'How well does the company acknowledge the risks of AI? Do they acknowledge all the risks? How long did it take them to acknowledge the risks?'
	},
	{
		name: 'Lobby',
		key: 'lobby',
		explanation:
			'How much does the company lobby for AI regulation? Do they lobby for deregulation or for stricter regulation?'
	},
	{
		name: 'Deployment',
		key: 'deployment',
		explanation:
			'How long does the company wait before deploying a new model? Do they wait until they have a good understanding of the risks of the model? Are their models tested thoroughly?'
	}
]
