import type { Campaign } from '$lib/types'

export const campaigns: Campaign[] = [
	{
		title: 'If anyone builds it, everyone dies',
		description:
			"Eliezer's new book deserves some promotion. We're helping out with the promotion.",
		image: 'https://dummyimage.com/400x200/ccc/000.png&text=Campaign+1',
		url: '/if-anyone-builds-it-everyone-dies',
		isCurrent: true
	},
	{
		title: 'DeepMind: keep your promises',
		description: 'Google DeepMind ',
		image: 'https://dummyimage.com/400x200/ccc/000.png&text=Campaign+2',
		url: '/deepmind-promises-campaign',
		isCurrent: true
	},
	{
		title: "OpenAI's Potential Breach of Bioweapons Laws",
		description:
			"OpenAI's release of ChatGPT agent may have violated Australia's bioweapons laws, as their own safety testing classified the model as having 'high' biological and chemical capabilities. As these capabilities could aid novices in the creation of bioweapons, we filed a report with the Australia Federal Police on the matter.",
		image: 'https://dummyimage.com/400x200/ccc/000.png&text=Campaign+3',
		url: '/openai-breach-bioweapons',
		isCurrent: false
	}
]
