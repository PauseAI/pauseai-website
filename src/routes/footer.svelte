<script lang="ts">
	import ExternalLink from '$lib/components/custom/a.svelte'
	import Toggle from '$lib/components/Toggle.svelte'
	import Edit from '$lib/components/Edit.svelte'
	import WithdrawWidgetConsent from '$lib/components/widget-consent/WithdrawWidgetConsent.svelte'
	import Socials from '$lib/components/Socials.svelte'
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte'
	import Navlink from '$lib/components/Navlink.svelte'
</script>

<footer>
	<div class="joinbar">
		<Navlink href="/join" activeClass="c2a">Join PauseAI &gt;</Navlink>
		<div class="socials">
			<Socials />
		</div>
	</div>
	<div class="bar" />
	<div class="footer-links">
		<div class="column">
			<h2>Info</h2>
			<Navlink href="/faq">FAQ</Navlink>
			<Navlink href="/proposal">Proposal</Navlink>
			<Navlink href="/learn">Learn</Navlink>
			<Navlink href="/press">Press / Media</Navlink>
			<Navlink href="/people">People</Navlink>
			<Navlink href="/teams">Teams</Navlink>
			<Navlink href="/partnerships">Partnerships</Navlink>
			<Navlink href="/privacy">Privacy policy</Navlink>
			<Navlink href="/legal">Legal Info <br /> Stichting PauseAI <br /> (kvk 92951031)</Navlink>
		</div>
		<div class="column">
			<h2>Risks</h2>
			<Navlink href="/risks">Risks overview</Navlink>
			<Navlink href="/outcomes">AI Outcomes</Navlink>
			<Navlink href="/xrisk">Existential risk</Navlink>
			<Navlink href="/psychology-of-x-risk">Psychology of x-risk</Navlink>
			<Navlink href="/ai-takeover">AI takeover</Navlink>
			<Navlink href="/cybersecurity-risks">Cybersecurity</Navlink>
			<Navlink href="/dangerous-capabilities">Dangerous capabilities</Navlink>
			<Navlink href="/sota">State of the art</Navlink>
			<Navlink href="/urgency">Urgency</Navlink>
		</div>
		<div class="column">
			<h2>Take Action</h2>
			<Navlink href="/join">Join PauseAI</Navlink>
			<Navlink href="/action">How you can help</Navlink>
			<Navlink href="/communities">Local communities</Navlink>
			<Navlink href="/donate">Donate</Navlink>
			<ExternalLink href="https://pauseai-shop.fourthwall.com" target="_blank"
				>Merchandise</ExternalLink
			>
			<Navlink href="/protests">Protests</Navlink>
			<Navlink href="/organizing-a-protest">Organize a protest</Navlink>
			<Navlink href="/email-builder">Email builder</Navlink>
			<Navlink href="/lobby-tips">Lobby tips</Navlink>
		</div>
		<div class="column">
			<h2>Other</h2>
			<Toggle />
			<LanguageSwitcher />
			<WithdrawWidgetConsent />
			<Edit />
			<Navlink href="/posts">All pages</Navlink>
			<Navlink href="/rss.xml">RSS</Navlink>
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

	@media (max-width: 550px) {
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

	.footer-links :global(a) {
		color: var(--text-2);
		text-decoration: none;
	}

	.footer-links :global(a:hover) {
		text-decoration: underline;
	}
</style>
