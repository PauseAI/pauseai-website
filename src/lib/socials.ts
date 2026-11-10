import type { Component } from 'svelte'
import Bluesky from '$lib/components/icons/bluesky.svelte'
import Discord from '$lib/components/icons/discord.svelte'
import Facebook from '$lib/components/icons/facebook.svelte'
import Instagram from '$lib/components/icons/instagram.svelte'
import Linkedin from '$lib/components/icons/linkedin.svelte'
import Reddit from '$lib/components/icons/reddit.svelte'
import Substack from '$lib/components/icons/substack.svelte'
import Telegram from '$lib/components/icons/telegram.svelte'
import TikTok from '$lib/components/icons/tiktok.svelte'
import Whatsapp from '$lib/components/icons/whatsapp.svelte'
import X from '$lib/components/icons/x.svelte'
import Youtube from '$lib/components/icons/youtube.svelte'

export type Social = {
	name: string
	href: string
	/** Used on /links (social media bios) when it differs from `href`, e.g. a separate invite code */
	bioHref?: string
	icon: Component
}

/** PauseAI's social channels, in the order shown on /links and in the footer */
export const socials: Social[] = [
	{ name: 'X', href: 'https://x.com/PauseAI', icon: X },
	{ name: 'Bluesky', href: 'https://bsky.app/profile/pauseai.bsky.social', icon: Bluesky },
	{ name: 'YouTube', href: 'https://www.youtube.com/@PauseAI', icon: Youtube },
	{
		name: 'Discord',
		href: 'https://discord.gg/2XXWXvErfA',
		bioHref: 'https://discord.gg/btFFF2mETe',
		icon: Discord
	},
	{ name: 'Substack', href: 'https://substack.com/@pauseai', icon: Substack },
	{ name: 'Reddit', href: 'https://www.reddit.com/r/PauseAI/', icon: Reddit },
	{ name: 'Facebook', href: 'https://www.facebook.com/PauseAI', icon: Facebook },
	{ name: 'Instagram', href: 'https://www.instagram.com/pause_ai', icon: Instagram },
	{ name: 'LinkedIn', href: 'https://www.linkedin.com/company/pauseai', icon: Linkedin },
	{ name: 'TikTok', href: 'https://www.tiktok.com/@pauseai', icon: TikTok },
	{
		name: 'WhatsApp Community',
		href: 'https://chat.whatsapp.com/JgcAbjqRr8X3tvrXdeQvfj',
		icon: Whatsapp
	},
	{ name: 'Telegram', href: 'https://t.me/+UeTsIsNkmt82ZmQ8', icon: Telegram }
]
