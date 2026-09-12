import type { ChapterLink } from './types.js'

// The links PauseAI Global's own content points at, shared by the copy in copy.ts and by
// the chapter overrides: a footer or a video that differs between them is a bug nobody sees.

export const VIDEO_URL = 'https://www.youtube.com/watch?v=ZHxJwv4TdJo'
export const ACTION_PAGE_URL = 'https://pauseai.info/action'
export const PROPOSAL_URL = 'https://pauseai.info/proposal'
export const WELCOME_CALLS_URL = 'https://luma.com/PauseAI?tag=welcome'
// The invite the rest of the site uses. The old templates linked discord.gg/gTymKVFs7Z in
// their body while their footer used this one, so an email offered two invites to one server.
export const GLOBAL_DISCORD_URL = 'https://discord.gg/2XXWXvErfA'

/** The footer row of the Global templates. */
export const GLOBAL_SOCIALS: ChapterLink[] = [
	{ label: 'YouTube', url: 'https://www.youtube.com/@PauseAI' },
	{ label: 'Discord', url: 'https://discord.gg/2XXWXvErfA' },
	{ label: 'Instagram', url: 'https://www.instagram.com/pause_ai/' },
	{ label: 'X', url: 'https://twitter.com/PauseAI' },
	{ label: 'Bluesky', url: 'https://bsky.app/profile/pauseai.bsky.social' },
	{ label: 'TikTok', url: 'https://tiktok.com/@pauseai' },
	{ label: 'Facebook', url: 'https://www.facebook.com/PauseAI/' }
]
