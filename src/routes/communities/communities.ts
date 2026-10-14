import type { StrictPost } from '$lib/types'
import adjacentCommunitiesJson from './adjacent-communities.json'
import pauseAICommunitiesJson from './pauseai-communities.json'
import nationalChaptersJson from '$lib/data/national-chapters.json'

export type CommunitiesConfiguration = {
	communities: RawCommunity[]
}

type RawCommunity = {
	name: string
	lat: number
	lon: number
	/** Empty local-community links fall back to the parent national chapter, then to PauseAI Global's Discord */
	link: string
	parent_name?: string
	country_local?: string
}

export type Community = RawCommunity & {
	type: 'local' | 'national' | 'adjacent'
	country?: string
}

export const communitiesMeta: StrictPost = {
	title: 'Find your PauseAI Community',
	description: 'A map of all PauseAI communities, people and events around the world.',
	date: '2023-12-15',
	slug: 'communities',
	categories: []
}

// Placeholders kept out of the JSON files; a community with a real link of its own points
// there directly. PauseAI Global's own Discord invite.
export const GLOBAL_DISCORD_URL = 'https://discord.gg/CR5u5BTBwy'

const LINK_PLACEHOLDERS = {
	$$DISCORD_GERMANY$$: 'https://discord.gg/VuVVyJQ37M',
	$$DISCORD_FRANCE$$: 'https://discord.gg/vyXGd7AeGc',
	$$WHATSAPP_ITALY$$: 'https://chat.whatsapp.com/Cue9aeK6kpJFoDxT3xV9Zx',
	$$WEBSITE_US$$: 'https://www.pauseai-us.org/local-groups/'
}

const pauseAICommunities: Community[] = (
	pauseAICommunitiesJson satisfies CommunitiesConfiguration
).communities.map((c) => ({
	...c,
	type: 'local',
	country:
		nationalChaptersJson.communities.find((n) => c.parent_name?.includes(n.name))?.name || undefined // Use undefined instead of null
}))

const adjacentCommunities: Community[] = (
	adjacentCommunitiesJson satisfies CommunitiesConfiguration
).communities.map((c) => ({ ...c, type: 'adjacent' }))

const nationalChapters: Community[] = (
	nationalChaptersJson satisfies CommunitiesConfiguration
).communities.map((c) => ({
	...c,
	type: 'national',
	link: c.link // Ensure the link is passed through
}))

/**
 * Where a local community's empty link points: the parent national chapter first,
 * PauseAI Global's Discord when there is no chapter with a link of its own.
 * National and adjacent communities keep their own (possibly empty) link.
 */
function resolveLink(community: Community): string {
	if (community.link.length > 0 || community.type !== 'local') return community.link
	const parent = nationalChapters.find((n) => community.parent_name?.includes(n.name))
	return parent?.link.length ? parent.link : GLOBAL_DISCORD_URL
}

for (const community of [...adjacentCommunities, ...pauseAICommunities, ...nationalChapters]) {
	if (!(
		community.link.startsWith('http') ||
		community.link.startsWith('mailto') ||
		community.link in LINK_PLACEHOLDERS ||
		community.link.length === 0
	)) {
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
	link: (LINK_PLACEHOLDERS as Record<string, string>)[community.link] || resolveLink(community)
}))
