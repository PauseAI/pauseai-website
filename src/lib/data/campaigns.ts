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
		description:
			'Google DeepMind have violated the promises they made to the UK government. They need to be held accountable.',
		image: 'https://dummyimage.com/400x200/ccc/000.png&text=Campaign+2',
		url: '/deepmind-promises-campaign',
		isCurrent: true
	},
	{
		title: "OpenAI's Potential Breach of Bioweapons Laws",
		description:
			"ChatGPT agent may have violated Australia's bioweapons laws, so we filed a report with the Australia Federal Police.",
		image: 'https://dummyimage.com/400x200/ccc/000.png&text=Campaign+3',
		url: '/openai-breach-bioweapons',
		isCurrent: false
	},
	{
		title: 'SB 53',
		description:
			'This bill is among the most ambitious AI safety bills in the US, but it might not go into effect till 2030.',
		image: 'https://dummyimage.com/400x200/ccc/000.png&text=Campaign+4',
		url: '/sb-53',
		isCurrent: false
	}
]
