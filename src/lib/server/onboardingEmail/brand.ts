import { socialUrl, type SocialName } from '../../socials.js'
import type { ChapterLink } from './types.js'

// The links PauseAI Global's own content points at, shared by the copy in copy.ts and by
// the chapter overrides: a footer or a video that differs between them is a bug nobody sees.

export const VIDEO_URL = 'https://www.youtube.com/watch?v=ZHxJwv4TdJo'
export const ACTION_PAGE_URL = 'https://pauseai.info/action'
export const PROPOSAL_URL = 'https://pauseai.info/proposal'
export const WELCOME_CALLS_URL = 'https://luma.com/PauseAI?tag=welcome'
// The invite the rest of the site uses. The old templates linked discord.gg/gTymKVFs7Z in
// their body while their footer used this one, so an email offered two invites to one server.
export const GLOBAL_DISCORD_URL = socialUrl('Discord')

/** The footer row of the Global templates: a subset of the site's channels, URLs from $lib/socials. */
const GLOBAL_SOCIAL_NAMES: SocialName[] = [
	'YouTube',
	'Discord',
	'Instagram',
	'X',
	'Bluesky',
	'TikTok',
	'Facebook'
]
export const GLOBAL_SOCIALS: ChapterLink[] = GLOBAL_SOCIAL_NAMES.map((name) => ({
	label: name,
	url: socialUrl(name)
}))
