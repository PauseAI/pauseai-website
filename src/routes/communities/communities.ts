import type { Post } from '$lib/types'
import adjacentCommunitiesJson from './adjacent-communities.json'
import pauseAICommunitiesJson from './pauseai-communities.json'
import nationalChaptersJson from './national-chapters.json'

export type CommunitiesConfiguration = {
	communities: RawCommunity[]
}

type RawCommunity = {
	name: string
	lat: number
	lon: number
	/** Will default to PauseAI Discord */
	link: string
}

export type Community = RawCommunity & {
    type: 'local' | 'national' | 'adjacent';
    country?: string;
};

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

const pauseAICommunities: Community[] = (
    pauseAICommunitiesJson satisfies CommunitiesConfiguration
).communities.map((c) => ({
    ...c,
    type: 'local',
    country: nationalChaptersJson.communities.find((n) =>
        c.parent_name?.includes(n.name)
    )?.name || undefined // Use undefined instead of null
}));

const adjacentCommunities: Community[] = (
	adjacentCommunitiesJson satisfies CommunitiesConfiguration
).communities.map((c) => ({ ...c, type: 'adjacent' }))

const nationalChapters: Community[] = (
    nationalChaptersJson satisfies CommunitiesConfiguration
).communities.map((c) => ({
    ...c,
    type: 'national',
    link: c.link // Ensure the link is passed through
}));

for (const community of [...adjacentCommunities, ...pauseAICommunities, ...nationalChapters]) {
	if (
		!(
			community.link.startsWith('http') ||
			community.link.startsWith('mailto') ||
			community.link in LINK_PLACEHOLDERS
		)
	) {
		throw Error('Invalid link for community: ' + community.name)
	}
}

/** All communities, PauseAI communities last to render them on top */
export const communities: Community[] = [
	...adjacentCommunities.sort((a, b) => b.lat - a.lat),
	...pauseAICommunities.sort((a, b) => b.lat - a.lat),
	...nationalChapters.sort((a, b) => b.lat - a.lat)
].map((community) => ({
	...community,
	link: (LINK_PLACEHOLDERS as Record<string, string>)[community.link] || community.link
}))
