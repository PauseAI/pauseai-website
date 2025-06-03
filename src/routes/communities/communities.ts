import type { Post } from '$lib/types'
import adjacentCommunitiesJson from './adjacent-communities.json'
import pauseAICommunitiesJson from './pauseai-communities.json'

export type Community = {
	name: string
	lat: number
	lon: number
	/** Will default to PauseAI Discord */
	link: string
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

// Map placeholders to actual links
const LINK_PLACEHOLDERS = {
	$$DISCORD_GLOBAL$$: 'https://discord.gg/CR5u5BTBwy',
	$$DISCORD_US$$: 'https://discord.gg/TmpmYejE3e',
	$$DISCORD_GERMANY$$: 'https://discord.gg/VuVVyJQ37M',
	$$DISCORD_FRANCE$$: 'https://discord.gg/vyXGd7AeGc',
	$$WHATSAPP_ITALY$$: 'https://chat.whatsapp.com/Cue9aeK6kpJFoDxT3xV9Zx'
}

for (const community of [...adjacentCommunitiesJson, ...pauseAICommunitiesJson]) {
	if (!(community.link.startsWith('http') || community.link in LINK_PLACEHOLDERS)) {
		throw Error('Invalid link for community: ' + community.name)
	}
}

const pauseAICommunities: Community[] = pauseAICommunitiesJson satisfies Community[]
const adjacentCommunities: Community[] = adjacentCommunitiesJson satisfies Community[]

/** All communities, PauseAI communities last to render them on top */
export const communities: Community[] = [
	...adjacentCommunities.map((c) => ({ ...c, adjacent: true })).sort((a, b) => b.lat - a.lat),
	...pauseAICommunities.sort((a, b) => b.lat - a.lat)
].map((community) => ({
	...community,
	link: (LINK_PLACEHOLDERS as Record<string, string>)[community.link] || community.link
}))
