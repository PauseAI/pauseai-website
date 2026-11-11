/**
 * PauseAI's social channels, in the order shown on /links and in the site footer.
 * Plain data (no icons) so server code, such as the onboarding emails, can use it too;
 * the icons are in $lib/components/socialIcons.ts.
 */
export const socials = [
	{ name: 'X', href: 'https://x.com/PauseAI' },
	{ name: 'Bluesky', href: 'https://bsky.app/profile/pauseai.bsky.social' },
	{ name: 'YouTube', href: 'https://www.youtube.com/@PauseAI' },
	{
		name: 'Discord',
		href: 'https://discord.gg/2XXWXvErfA',
		// A separate permanent invite to the same server, used only from social media bios
		// (via /links). Neither invite expires.
		bioHref: 'https://discord.gg/btFFF2mETe'
	},
	{ name: 'Substack', href: 'https://substack.com/@pauseai' },
	{ name: 'Reddit', href: 'https://www.reddit.com/r/PauseAI/' },
	{ name: 'Facebook', href: 'https://www.facebook.com/PauseAI' },
	{ name: 'Instagram', href: 'https://www.instagram.com/pause_ai' },
	{ name: 'LinkedIn', href: 'https://www.linkedin.com/company/pauseai' },
	{ name: 'TikTok', href: 'https://www.tiktok.com/@pauseai' },
	{ name: 'WhatsApp Community', href: 'https://chat.whatsapp.com/JgcAbjqRr8X3tvrXdeQvfj' },
	{ name: 'Telegram', href: 'https://t.me/+UeTsIsNkmt82ZmQ8' }
] as const satisfies readonly Social[]

export type Social = {
	name: string
	href: string
	/** Used on /links (social media bios) instead of `href`, when set */
	bioHref?: string
}

export type SocialName = (typeof socials)[number]['name']

/** The main URL for one channel */
export function socialUrl(name: SocialName): string {
	const social = socials.find((s) => s.name === name)
	if (!social) throw new Error(`Unknown social channel: ${name}`)
	return social.href
}
