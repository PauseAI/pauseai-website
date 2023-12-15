import type { Post } from '$lib/types'

export type Community = {
	name: string
	// EPSG:3857
	lat: number
	// EPSG:3857
	lon: number
	link: string
	adjacent?: boolean
}

export const communitiesMeta: Post = {
	title: 'PauseAI Local Communities',
	description:
		'A map of all the local PauseAI communities around the world. Also shows adjacent AI Safety communities.',
	date: '2023-12-15',
	slug: 'outcomes',
	categories: []
}

const PauseAICommunities: Community[] = [
	{
		name: 'PauseAI Utrecht',
		lat: 52.09073739999999,
		lon: 5.081420100000023,
		link: 'https://discord.gg/PsvZwpmvYE'
	},
	{
		name: 'PauseAI SF',
		lat: 37.7749,
		lon: -122.4194,
		link: 'https://discord.gg/FGRxJr5JWj'
	},
	{
		name: 'PauseAI London',
		lat: 51.5073509,
		lon: -0.12775829999998223,
		link: 'https://chat.whatsapp.com/CkkycjLr6H96lEzJs2ezox'
	}
]

const AdjacentCommunities: Community[] = [
	{
		name: 'AI Safety Team Eindhoven',
		lat: 51.441642,
		lon: 5.46972250000004,
		link: 'https://www.eaeindhoven.nl/ai-safety-team'
	},
	{
		name: 'AI Safety Utrecht',
		lat: 52.09073739999999,
		lon: 5.121420100000023,
		link: 'https://eautrecht.nl/aisafety'
	},
	{
		name: 'Delft AI Safety Initiative',
		lat: 52.0116,
		lon: 4.3571,
		link: 'https://www.delftaisafety.org/'
	},
	{
		name: 'OxAI Safety & Governance Team',
		lat: 51.752,
		lon: 1.2577,
		link: 'https://www.oxai.org/ai-safety'
	},
	{
		name: 'AI Safety Aachen',
		lat: 50.7753,
		lon: 6.0839,
		link: 'https://www.aisafetyaachen.org/'
	},
	{
		name: 'Cambridge AI Safety Hub',
		lat: 52.205337,
		lon: 0.1218170000000345,
		link: 'https://www.cambridgeaisafety.org/'
	},
	{
		name: 'Harvard AI safety team',
		lat: 42.377,
		lon: -71.1167,
		link: 'https://haist.ai/'
	},
	{
		name: 'AI Safety Hub Edinburgh (AISHED)',
		lat: 55.9533,
		lon: 3.1883,
		link: 'https://www.aished.org/'
	},
	{
		name: 'AI Safety Initiative at Georgia Tech',
		lat: 33.7756,
		lon: -84.3963,
		link: 'https://aisi.dev/'
	},
	{
		name: 'Berkeley AI Safety Student Initiative',
		lat: 37.8716,
		lon: -122.2727,
		link: 'https://berkeleyaisafety.com/'
	},
	{
		name: 'Stanford AI Alignment',
		lat: 37.4275,
		lon: -122.1697,
		link: 'https://stanfordaialignment.org/'
	},
	{
		name: 'MIT AI Alignment',
		lat: 42.3601,
		lon: -71.0942,
		link: 'https://www.mitalignment.org/'
	},
	{
		name: 'Princeton AI Alignment',
		lat: 40.3573,
		lon: -74.6672,
		link: 'https://sites.google.com/princeton.edu/princeton-ai-alignment'
	},
	{
		name: 'Michigan AI Safety Initiative',
		lat: 42.2808,
		lon: -83.743,
		link: 'https://maisi.club/'
	},
	{
		name: 'Carnegie AI Safety Initiative',
		lat: 40.4433,
		lon: -79.9436,
		link: 'https://www.carnegieaisafety.com/'
	},
	{
		name: 'AI Safety Initiative Groningen',
		lat: 53.2194,
		lon: 6.5665,
		link: 'https://www.aisig.org/'
	},
	{
		name: 'Zürich AI Alignment Group',
		lat: 47.3769,
		lon: 8.5417,
		link: 'https://www.zurich-ai-alignment.com/'
	},
	{
		name: 'Budapest AI Safety Group',
		lat: 47.4979,
		lon: 19.0402,
		link: 'https://www.budapestaisafety.org/'
	},
	{
		name: 'Wisconsin AI Safety Initiative',
		lat: 43.0731,
		lon: -89.4012,
		link: 'https://waisi.org/'
	}
]

export const communities: Community[] = [
	...AdjacentCommunities.map((a) => {
		a.adjacent = true
		return a
	}),
	...PauseAICommunities
]
