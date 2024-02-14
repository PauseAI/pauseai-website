import type { Post } from '$lib/types'

export type Community = {
	name: string
	lat: number
	lon: number
	/** Will default to PauseAI discord */
	link?: string
	/** Non-PauseAI org */
	adjacent?: boolean
}

export const communitiesMeta: Post = {
	title: 'PauseAI Local Communities',
	description:
		'A map of all the local PauseAI communities and people around the world. Also shows adjacent AI Safety communities.',
	date: '2023-12-15',
	slug: 'communities',
	categories: []
}

const discordInvite = 'https://discord.gg/CR5u5BTBwy'

const PauseAICommunities: Community[] = [
	{
		name: 'PauseAI Utrecht',
		lat: 52.09073739999999,
		lon: 5.081420100000023,
		link: discordInvite
	},
	{
		name: 'PauseAI Washington DC',
		lat: 38.9072,
		lon: -77.0369,
		link: discordInvite
	},
	{
		name: 'PauseAI Nottingham',
		lat: 52.9548,
		lon: -1.1581,
		link: discordInvite
	},
	{
		name: 'PauseAI Phoenix',
		lat: 33.4484,
		lon: -112.074,
		link: discordInvite
	},
	{
		name: 'PauseAI Orlando',
		lat: 28.5383,
		lon: -81.3792,
		link: discordInvite
	},
	{
		name: 'PauseAI Oldenburg',
		lat: 53.1412,
		lon: 8.2146,
		link: discordInvite
	},
	{
		name: 'PauseAI Seattle',
		lat: 47.6062,
		lon: -122.3321,
		link: discordInvite
	},
	{
		name: 'PauseAI Edinburgh',
		lat: 55.9533,
		lon: -3.1883,
		link: discordInvite
	},
	{
		name: 'PauseAI Manchester',
		lat: 53.4808,
		lon: -2.2426,
		link: discordInvite
	},
	{
		name: 'PauseAI Copenhagen',
		lat: 55.6761,
		lon: 12.5683,
		link: discordInvite
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
	},
	{
		name: 'PauseAI Los Angeles',
		lat: 34.0522,
		lon: -118.2437,
		link: discordInvite
	},
	{
		name: 'PauseAI Rosario',
		lat: -32.9442,
		lon: -60.6505,
		link: discordInvite
	},
	{
		name: 'PauseAI Baltimore',
		lat: 39.2904,
		lon: -76.6122,
		link: discordInvite
	},
	{
		name: 'PauseAI Ausburg',
		lat: 48.3705,
		lon: 10.8978,
		link: discordInvite
	},
	{
		name: 'PauseAI Paris',
		lat: 48.8647,
		lon: 2.349,
		link: discordInvite
	},
	{
		name: 'PauseAI Miami',
		lat: 25.7616,
		lon: -80.1917,
		link: discordInvite
	},
	{
		name: 'PauseAI Montreal',
		lat: 45.5088,
		lon: -73.5616,
		link: discordInvite
	},
	{
		name: 'PauseAI Nairobi',
		lat: -1.286389,
		lon: 36.817223,
		link: discordInvite
	},
	{
		name: 'PauseAI Stockholm',
		lat: 59.3293,
		lon: 18.0686,
		link: discordInvite
	},{
		name: 'PauseAI Marseille',
		lat: 43.2963,
		lon: 5.37,
		link: discordInvite
	},
	{
		name: 'PauseAI Portland',
		lat: 45.5231,
		lon: -122.6765,
		link: discordInvite
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
		lon: -1.2577,
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
		lon: -3.1883,
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
	},
	{
		name: 'AI Safety Gothenburg',
		lat: 57.7089,
		lon: 11.9746,
		link: 'https://www.linkedin.com/company/ai-safety-gothenburg/'
	},
	{
		name: 'AI Safety Tokyo benkyokai',
		lat: 35.6895,
		lon: 139.6917,
		link: 'https://aisafety.tokyo/benkyoukai'
	},
	{
		name: 'Munich Artificial Intelligence Alignment (MAIA)',
		lat: 48.1351,
		lon: 11.582,
		link: 'https://www.munich-ai-alignment.org/'
	},
	{
		name: 'AI Safety Melbourne',
		lat: -37.8136,
		lon: 144.9631,
		link: 'https://www.facebook.com/groups/503645528219169'
	},
	{
		name: 'AIGS Canada Toronto',
		lat: 43.6532,
		lon: -79.3832,
		link: 'https://aigs.ca/events/'
	},
	{
		name: 'AI Safety Amsterdam',
		lat: 52.3702,
		lon: 4.8952,
		link: 'https://aisafetyamsterdam.com/'
	},
	{
		name: 'Vienna AI Safety Group',
		lat: 48.2082,
		lon: 16.3738,
		link: 'https://github.com/ViennaAI/info'
	},
	{
		name: 'AI Safety Denmark',
		lat: 55.6761,
		lon: 12.5683,
		link: 'https://www.facebook.com/groups/AISafetyDanmark'
	}
]

/** All communities, PauseAI communities last to render them on top */
export const communities: Community[] = [
	...AdjacentCommunities.map((a) => {
		a.adjacent = true
		return a
	}),
	...PauseAICommunities
]
