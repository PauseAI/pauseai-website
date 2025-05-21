<script lang="ts">
	import ExternalLink from '$lib/components/custom/a.svelte'
	import Toggle from '$lib/components/Toggle.svelte'
	import Edit from '$lib/components/Edit.svelte'
	import WithdrawWidgetConsent from '$lib/components/widget-consent/WithdrawWidgetConsent.svelte'
	import Socials from '$lib/components/Socials.svelte'
	import * as m from '$lib/paraglide/messages.js'
</script>

<footer>
	<div class="joinbar">
		<a class="c2a" href="/join">{m.footer_join()}</a>
		<div class="socials">
			<Socials />
		</div>
	</div>
	<div class="bar" />
	<div class="footer-links">
		<div class="column">
			<h2>{m.footer_info()}</h2>
			<a href="/faq">{m.footer_info_faq()}</a>
			<a href="/proposal">{m.footer_info_proposal()}</a>
			<a href="/learn">{m.footer_info_learn()}</a>
			<a href="/press">{m.footer_info_press()}</a>
			<a href="/people">{m.footer_info_people()}</a>
			<a href="/teams">{m.footer_info_teams()}</a>
			<a href="/partnerships">{m.footer_info_partnerships()}</a>
			<a href="/privacy">{m.footer_info_privacy()}</a>
			<a href="/legal"
				>{m.footer_info_legal()} <br />
				{m.footer_info_legal_foundation()} <br />
				{m.footer_info_legal_kvk()}</a
			>
		</div>
		<div class="column">
			<h2>{m.footer_risks()}</h2>
			<a href="/risks">{m.footer_risks_overview()}</a>
			<a href="/outcomes">{m.footer_risks_outcomes()}</a>
			<a href="/xrisk">{m.footer_risks_xrisk()}</a>
			<a href="/psychology-of-x-risk">{m.footer_risks_psychology()}</a>
			<a href="/ai-takeover">{m.footer_risks_takeover()}</a>
			<a href="/cybersecurity-risks">{m.footer_risks_cybersecurity()}</a>
			<a href="/dangerous-capabilities">{m.footer_risks_capabilities()}</a>
			<a href="/sota">{m.footer_risks_sota()}</a>
			<a href="/urgency">{m.footer_risks_urgency()}</a>
		</div>
		<div class="column">
			<h2>{m.footer_action()}</h2>
			<a href="/join">{m.footer_action_join()}</a>
			<a href="/action">{m.footer_action_help()}</a>
			<a href="/communities">{m.footer_action_communities()}</a>
			<a href="donate">{m.footer_action_donate()}</a>
			<ExternalLink href="https://pauseai-shop.fourthwall.com" target="_blank"
				>{m.footer_action_merchandise()}</ExternalLink
			>
			<a href="/events">{m.footer_action_events()}</a>
			<a href="/vacancies">{m.footer_action_vacancies()}</a>
			<a href="/email-builder">{m.footer_action_email()}</a>
			<a href="/lobby-tips">{m.footer_action_lobby()}</a>
		</div>
		<div class="column">
			<h2>{m.footer_other()}</h2>
			<Toggle />
			<WithdrawWidgetConsent />
			<Edit />
			<a href="/posts">{m.footer_other_pages()}</a>
			<a href="/rss.xml" target="_blank">{m.footer_other_rss()}</a>
			<ExternalLink href="https://creativecommons.org/licenses/by/4.0/" target="_blank"
				>{m.footer_other_license()}</ExternalLink
			>
			<ExternalLink
				href="https://airtable.com/appWPTGqZmUcs3NWu/pagIvo9Sv6IDHaolu/form"
				target="_blank">{m.footer_other_feedback()}</ExternalLink
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
		font-size: 0.9rem;
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

	.footer-links :global(:not(h2)) {
		opacity: 0.9;
	}

	.footer-links :global(:not(h2):hover) {
		opacity: 1;
	}

	.c2a {
		color: var(--text);
		text-transform: uppercase;
		text-decoration: none;
		font-size: 1.2rem;
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
