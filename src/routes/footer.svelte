<script lang="ts">
	import Link from '$lib/components/Link.svelte'
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
