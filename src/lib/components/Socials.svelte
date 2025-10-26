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
</script>

<div class="social">
	<a href="https://www.facebook.com/PauseAI/" target="_blank" title="Facebook">
		<Facebook />
	</a>
	<a href="https://discord.gg/2XXWXvErfA" target="_blank" title="Discord">
		<Discord />
	</a>
	<a href="https://twitter.com/PauseAI" target="_blank" title="X / Twitter">
		<X />
	</a>
	<a href="https://www.linkedin.com/company/pauseai" target="_blank" title="LinkedIn">
		<Linkedin />
	</a>
	<a href="https://www.tiktok.com/@pauseai" target="_blank" title="TikTok"><TikTok /></a>
	<a href="https://www.instagram.com/pause_ai/" target="_blank" title="Instagram">
		<Instagram />
	</a>
	<a href="https://www.youtube.com/@PauseAI" target="_blank" title="YouTube"> <Youtube /></a>
	<a href="https://substack.com/@pauseai" target="_blank" title="Substack"><Substack /></a>
	<a href="https://www.reddit.com/r/PauseAI/" target="_blank" title="Reddit"><Reddit /></a>
	<a href="https://t.me/+UeTsIsNkmt82ZmQ8" target="_blank" title="Telegram"><Telegram /></a>
	<!--	<a href="https://chat.whatsapp.com/JgcAbjqRr8X3tvrXdeQvfj" target="_blank" title="Whatsapp"-->
	<!--		><Whatsapp /></a-->
	<!--	>-->
	<a href="https://bsky.app/profile/pauseai.bsky.social"><Bluesky /></a>
</div>

<style>
	.social {
		display: flex;
		margin-left: -0.5rem;
		margin-right: -0.5rem;
		flex-wrap: wrap;
	}

	.social a {
		padding: 0.5rem;
		width: 1rem;
		height: 1rem;
		display: flex;
		fill: var(--text);
	}

	.social a:hover {
		fill: var(--brand);
	}
</style>
