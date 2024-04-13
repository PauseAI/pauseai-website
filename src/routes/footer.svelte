<script lang="ts">
	import ExternalLink from '$lib/components/custom/a.svelte'
	import Toggle from '$lib/components/Toggle.svelte'
	import Edit from '$lib/components/Edit.svelte'
	import WithdrawWidgetConsent from '$lib/components/widget-consent/WithdrawWidgetConsent.svelte'
	import Socials from '$lib/components/Socials.svelte'
</script>

<footer>
	<div class="joinbar">
		<a class="c2a" href="/join">Join PauseAI &gt;</a>
		<div class="socials">
			<Socials />
		</div>
	</div>
	<div class="bar" />
	<div class="footer-links">
		<div class="column">
			<h2>Info</h2>
			<a href="/faq">FAQ</a>
			<a href="/proposal">Proposal</a>
			<a href="/learn">Learn</a>
			<a href="/press">Press / Media</a>
			<a href="/legal">Legal Info <br /> Stichting PauseAI <br /> (kvk 92951031)</a>
		</div>
		<div class="column">
			<h2>Risks</h2>
			<a href="/risks">Risks overview</a>
			<a href="/outcomes">AI Outcomes</a>
			<a href="/xrisk">Existential risk</a>
			<a href="/psychology-of-x-risk">Psychology of x-risk</a>
			<a href="/ai-takeover">AI takeover</a>
			<a href="/cybersecurity-risks">Cybersecurity</a>
			<a href="/dangerous-capabilities">Dangerous capabilities</a>
			<a href="/sota">State of the art</a>
			<a href="/urgency">Urgency</a>
		</div>
		<div class="column">
			<h2>Take Action</h2>
			<a href="/join">Join PauseAI</a>
			<a href="/action">How you can help</a>
			<a href="/communities">Local communities</a>
			<a href="donate">Donate</a>
			<ExternalLink href="https://pauseai-shop.fourthwall.com" target="_blank"
				>Merchandise</ExternalLink
			>
			<a href="/protests">Protests</a>
			<a href="/organizing-a-protest">Organize a protest</a>
			<a href="/email-builder">Email builder</a>
			<a href="/lobby-tips">Lobby tips</a>
		</div>
		<div class="column">
			<h2>Other</h2>
			<Toggle />
			<WithdrawWidgetConsent />
			<Edit />
			<a href="/posts">All pages</a>
			<a href="/rss.xml" target="_blank">RSS</a>
			<ExternalLink href="https://creativecommons.org/licenses/by/4.0/" target="_blank"
				>License: CC-BY 4.0</ExternalLink
			>
			<ExternalLink
				href="https://airtable.com/appWPTGqZmUcs3NWu/pagIvo9Sv6IDHaolu/form"
				target="_blank">Submit feedback</ExternalLink
			>
		</div>
	</div>
</footer>

<style>
	.joinbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
	}

	@media(max-width: 500px) {
		.socials {
			width: 100%;
		}
	}

	.bar {
		height: 3px;
		width: 100%;
		background-color: var(--brand);
		margin-bottom: 1rem;
		margin-top: 0.5rem;
	}

	.footer-links {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.2rem;
		font-size: 0.8rem;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}

	@media (max-width: 750px) {
		.footer-links {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.column {
		/* All equal width */
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.footer-links h2 {
		font-size: 1rem;
		font-family: var(--font-heading);
		font-weight: 700;
		margin-bottom: 0rem;
		margin-top: 0;
	}

	.c2a {
		color: var(--text);
		text-transform: uppercase;
		text-decoration: none;
		font-size: 1.1rem;
		font-family: var(--font-heading);
		font-weight: 700;
		text-align: left;
	}

	.c2a:hover {
		color: var(--brand);
	}

	.footer-links :global(a) {
		color: var(--text-2);
		text-decoration: none;
	}

	.footer-links :global(a:hover) {
		text-decoration: underline;
	}
</style>
