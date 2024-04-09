<script type="ts">
	import TikTok from '$lib/components/icons/tiktok.svelte'
	import Instagram from '$lib/components/icons/instagram.svelte'
	import Facebook from '$lib/components/icons/facebook.svelte'
	import Youtube from '$lib/components/icons/youtube.svelte'
	import Discord from '$lib/components/icons/discord.svelte'
	import Linkedin from '$lib/components/icons/linkedin.svelte'
	import X from '$lib/components/icons/x.svelte'
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
</div>

<style>
	.social {
		display: flex;
		align-self: flex-end;
		justify-content: flex-end;
		gap: 1rem;
	}

	.social a {
		width: 1rem;
		display: inline-block;
		fill: var(--text);
	}

	.social a:hover {
		fill: var(--brand);
	}
</style>
