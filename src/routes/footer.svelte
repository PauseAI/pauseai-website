<script lang="ts">
	import Link from '$lib/components/custom/a.svelte'
	import Toggle from '$lib/components/Toggle.svelte'
	import Edit from '$lib/components/Edit.svelte'
	import WithdrawWidgetConsent from '$lib/components/widget-consent/WithdrawWidgetConsent.svelte'
	import Socials from '$lib/components/Socials.svelte'
	import * as m from '$lib/paraglide/messages.js'
</script>

<footer>
	<div class="joinbar">
		<Link class="c2a" href="/join">{m.footer_join()}</Link>
		<div class="socials">
			<Socials />
		</div>
	</div>
	<div class="bar" />
	<div class="footer-links">
		<div class="column">
			<h2>{m.footer_info()}</h2>
			<Link href="/faq">{m.footer_info_faq()}</Link>
			<Link href="/proposal">{m.footer_info_proposal()}</Link>
			<Link href="/learn">{m.footer_info_learn()}</Link>
			<Link href="/press">{m.footer_info_press()}</Link>
			<Link href="/teams">{m.footer_info_teams()}</Link>
			<Link href="/partnerships">{m.footer_info_partnerships()}</Link>
			<Link href="/privacy">{m.footer_info_privacy()}</Link>
			<Link href="/legal"
				>{m.footer_info_legal()} <br />
				{m.footer_info_legal_foundation()} <br />
				{m.footer_info_legal_kvk()}</Link
			>
		</div>
		<div class="column">
			<h2>{m.footer_risks()}</h2>
			<Link href="/risks">{m.footer_risks_overview()}</Link>
			<Link href="/outcomes">{m.footer_risks_outcomes()}</Link>
			<Link href="/xrisk">{m.footer_risks_xrisk()}</Link>
			<Link href="/psychology-of-x-risk">{m.footer_risks_psychology()}</Link>
			<Link href="/ai-takeover">{m.footer_risks_takeover()}</Link>
			<Link href="/cybersecurity-risks">{m.footer_risks_cybersecurity()}</Link>
			<Link href="/dangerous-capabilities">{m.footer_risks_capabilities()}</Link>
			<Link href="/sota">{m.footer_risks_sota()}</Link>
			<Link href="/urgency">{m.footer_risks_urgency()}</Link>
		</div>
		<div class="column">
			<h2>{m.footer_action()}</h2>
			<Link href="/join">{m.footer_action_join()}</Link>
			<Link href="/action">{m.footer_action_help()}</Link>
			<Link href="/communities">{m.footer_action_communities()}</Link>
			<Link href="donate">{m.footer_action_donate()}</Link>
			<Link href="https://pauseai-shop.fourthwall.com" target="_blank"
				>{m.footer_action_merchandise()}</Link
			>
			<Link href="/events">{m.footer_action_events()}</Link>
			<Link href="/vacancies">{m.footer_action_vacancies()}</Link>
			<Link href="/email-builder">{m.footer_action_email()}</Link>
			<Link href="/lobby-tips">{m.footer_action_lobby()}</Link>
		</div>
		<div class="column">
			<h2>{m.footer_other()}</h2>
			<Toggle />
			<WithdrawWidgetConsent />
			<Edit />
			<Link href="/posts">{m.footer_other_pages()}</Link>
			<Link href="/rss.xml" target="_blank">{m.footer_other_rss()}</Link>
			<Link href="https://creativecommons.org/licenses/by/4.0/" target="_blank"
				>{m.footer_other_license()}</Link
			>
			<Link href="https://airtable.com/appWPTGqZmUcs3NWu/pagIvo9Sv6IDHaolu/form" target="_blank"
				>{m.footer_other_feedback()}</Link
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

	:global(.c2a) {
		color: var(--text);
		text-transform: uppercase;
		text-decoration: none;
		font-size: 1.1rem;
		font-family: var(--font-heading);
		font-weight: 700;
		text-align: left;
	}

	:global(.c2a:hover) {
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
