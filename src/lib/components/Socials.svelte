<script type="ts">
	import TikTok from '$lib/components/icons/tiktok.svelte'
	import Instagram from '$lib/components/icons/instagram.svelte'
	import Facebook from '$lib/components/icons/facebook.svelte'
	import Youtube from '$lib/components/icons/youtube.svelte'
	import Discord from '$lib/components/icons/discord.svelte'
	import Linkedin from '$lib/components/icons/linkedin.svelte'
	import X from '$lib/components/icons/x.svelte'
	import Substack from './icons/substack.svelte'
	import Reddit from './icons/reddit.svelte'
	import Telegram from './icons/telegram.svelte'
	import Bluesky from './icons/bluesky.svelte'
	import Whatsapp from './icons/whatsapp.svelte'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
</script>

<div class="social">
	<LinkWithoutIcon
		href="https://www.facebook.com/PauseAI/"
		target="_blank"
		title="Facebook"
		class="social-link"
	>
		<Facebook />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://discord.gg/2XXWXvErfA"
		target="_blank"
		title="Discord"
		class="social-link"
	>
		<Discord />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://twitter.com/PauseAI"
		target="_blank"
		title="X / Twitter"
		class="social-link"
	>
		<X />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://www.linkedin.com/company/pauseai"
		target="_blank"
		title="LinkedIn"
		class="social-link"
	>
		<Linkedin />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://www.tiktok.com/@pauseai"
		target="_blank"
		title="TikTok"
		class="social-link"
	>
		<TikTok />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://www.instagram.com/pause_ai/"
		target="_blank"
		title="Instagram"
		class="social-link"
	>
		<Instagram />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://www.youtube.com/@PauseAI"
		target="_blank"
		title="YouTube"
		class="social-link"
	>
		<Youtube />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://substack.com/@pauseai"
		target="_blank"
		title="Substack"
		class="social-link"
	>
		<Substack />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://www.reddit.com/r/PauseAI/"
		target="_blank"
		title="Reddit"
		class="social-link"
	>
		<Reddit />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://t.me/+UeTsIsNkmt82ZmQ8"
		target="_blank"
		title="Telegram"
		class="social-link"
	>
		<Telegram />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://chat.whatsapp.com/JgcAbjqRr8X3tvrXdeQvfj"
		target="_blank"
		title="Whatsapp"
		class="social-link"
	>
		<Whatsapp />
	</LinkWithoutIcon>
	<LinkWithoutIcon
		href="https://bsky.app/profile/pauseai.bsky.social"
		class="social-link"
		title="Bluesky"
	>
		<Bluesky />
	</LinkWithoutIcon>
</div>

<style>
	.social {
		display: flex;
		margin-left: -0.5rem;
		margin-right: -0.5rem;
		flex-wrap: wrap;
	}

	.social :global(.social-link) {
		padding: 0.5rem;
		width: 1rem;
		height: 1rem;
		display: flex;
		fill: var(--text);
	}

	.social :global(.social-link):hover {
		fill: var(--brand);
	}
</style>
