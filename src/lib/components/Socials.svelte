<script type="ts">
	import TikTok from '$components/icons/tiktok.svelte'
	import Instagram from '$components/icons/instagram.svelte'
	import Facebook from '$components/icons/facebook.svelte'
	import Youtube from '$components/icons/youtube.svelte'
	import Discord from '$components/icons/discord.svelte'
	import Linkedin from '$components/icons/linkedin.svelte'
	import X from '$components/icons/x.svelte'
	import Substack from '$components/icons/substack.svelte'
	import Threads from '$components/icons/Threads.svelte'
</script>

<div class="social">
	<a href="https://www.facebook.com/Pause.IA/" target="_blank" title="Facebook">
		<Facebook />
	</a>
	<a href="https://discord.gg/vyXGd7AeGc" target="_blank" title="Discord">
		<Discord />
	</a>
	<a href="https://twitter.com/pause_ia" target="_blank" title="X / Twitter">
		<X />
	</a>
	<a href="https://www.linkedin.com/company/pause-ia/" target="_blank" title="LinkedIn">
		<Linkedin />
	</a>
	<a href="https://www.tiktok.com/@pause_ia" target="_blank" title="TikTok"><TikTok /></a>
	<a href="https://www.instagram.com/pause_ia/" target="_blank" title="Instagram">
		<Instagram />
	</a>
	<a href="https://www.youtube.com/@Pause_IA" target="_blank" title="YouTube"> <Youtube /></a>
	<a href="https://pauseia.substack.com/" target="_blank" title="Substack"><Substack /></a>
	<a href="https://www.threads.net/@pause_ia" target="_blank" title="Threads"><Threads /></a>
</div>

<style>
	.social {
		display: flex;
		flex-wrap: wrap;
		margin-left: -0.5rem;
		margin-right: -0.5rem;
		width: fit-content;
		justify-content: start;
	}

	.social a {
		padding: 0.5rem;
		width: 3rem;
		height: 3rem;
		display: flex;
		fill: var(--text);
	}

	.social a:hover {
		fill: var(--white);
	}

	@media (min-width: 768px) {
		.social {
			justify-content: center;
		}
	}
</style>
