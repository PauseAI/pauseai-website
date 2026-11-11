import type { Component } from 'svelte'
import type { SocialName } from '$lib/socials'
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

export const socialIcons: Record<SocialName, Component> = {
	X,
	Bluesky,
	YouTube: Youtube,
	Discord,
	Substack,
	Reddit,
	Facebook,
	Instagram,
	LinkedIn: Linkedin,
	TikTok,
	'WhatsApp Community': Whatsapp,
	Telegram
}
