<script lang="ts">
	import Toggle from '$lib/components/Toggle.svelte'
	import { page } from '$app/stores'

	$: editUrl = `https://github.com/joepio/pauseai/edit/main/src/posts${$page.url.pathname}.md`
	$: if ($page.url.pathname == '/') {
		editUrl = `https://github.com/joepio/pauseai/edit/main/src/routes/%2Bpage.svelte`
	}
</script>

<a class="c2a" href="/join">Join PauseAI ></a>
<div class="bar" />
<footer>
	<div class="column">
		<h2>Info</h2>
		<a href="/faq">FAQ</a>
		<a href="/proposal">Proposal</a>
		<a href="/learn">Learn</a>
		<a href="/sota">State of AI</a>
		<a href="/psychology-of-x-risk">Psychology of x-risk</a>
		<a href="/4-levels-of-ai-regulation">4 Levels of regulation</a>
		<a href="https://pauseai-shop.fourthwall.com" target="_blank">Merchandise</a>
	</div>
	<div class="column">
		<h2>Risks</h2>
		<a href="/outcomes">AI Outcomes</a>
		<a href="/risks">Risks overview</a>
		<a href="/xrisk">Existential risk</a>
		<a href="/ai-takeover">AI takeover</a>
		<a href="/cybersecurity-risks">Cybersecurity</a>
		<a href="/urgency">Urgency</a>
		<a href="/dangerous-capabilities">Capabilities</a>
	</div>
	<div class="column">
		<h2>Take Action</h2>
		<a href="/join">Join PauseAI</a>
		<a href="/communities">Local communities</a>
		<a href="/action">How you can help</a>
		<a href="/protests">Protests</a>
		<a href="/organizing-a-protest">Organize a protest</a>
		<a href="/writing-a-letter">Write a letter</a>
		<a href="/lobby-tips">Lobby tips</a>
	</div>
	<div class="column">
		<h2>Socials</h2>
		<a href="https://discord.gg/2XXWXvErfA" target="_blank">Discord</a>
		<a href="https://twitter.com/PauseAI" target="_blank">Twitter</a>
		<a href="https://www.linkedin.com/company/pauseai" target="_blank">LinkedIn</a>
		<a href="https://www.facebook.com/PauseAI/" target="_blank">Facebook</a>
		<a href="https://www.tiktok.com/@pauseai" target="_blank">TikTok</a>
		<a href="https://www.instagram.com/pause_ai/" target="_blank">Instagram</a>
		<a href="https://www.youtube.com/@PauseAI" target="_blank">YouTube</a>
	</div>
	<div class="column">
		<h2>Other</h2>
		<Toggle />
		<a href={editUrl}>Edit this page</a>
		<a href="/posts">All pages</a>
		<a href="/rss.xml" target="_blank">RSS</a>
		<a href="https://creativecommons.org/licenses/by/2.0/" target="_blank">Shared under CC-BY</a>
	</div>
</footer>

<style>
	.bar {
		height: 3px;
		width: 100%;
		background-color: var(--brand);
		margin-bottom: 1rem;
		margin-top: 0.5rem;
	}

	footer {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 1rem;
		font-size: 0.7rem;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}

	@media (max-width: 750px) {
		footer {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.column {
		/* All equal width */
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		flex: 1;
	}

	footer h2 {
		font-size: 0.9rem;
		font-family: var(--font-heading);
		margin-bottom: 0rem;
		margin-top: 0;
	}

	.c2a {
		color: var(--text);
		text-transform: uppercase;
		text-decoration: none;
		font-size: 1rem;
		font-family: var(--font-heading);
		text-align: left;
	}

	a {
		color: var(--text-2);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
