<script lang="ts">
	import ExternalLink from '$lib/components/custom/a.svelte'
	import Toggle from '$lib/components/Toggle.svelte'
	import Edit from '$lib/components/Edit.svelte'
	import WithdrawWidgetConsent from '$lib/components/widget-consent/WithdrawWidgetConsent.svelte'
	import Socials from '$lib/components/Socials.svelte'
	import Logo from '$lib/components/logo.svelte'
</script>

<footer>
	<div class="logo">
		<Logo fill_circle="white" fill_ai="white" />
		<p>Pour une IA alignée sur l’humanité.</p>
	</div>
	<div class="footer-links">
		<div class="column">
			<h2>Information</h2>
			<a href="/faq">FAQ</a>
			<a href="/proposal">Propositions</a>
			<a href="/learn">Apprendre</a>
			<a href="/press">Presse / Media</a>
			<a href="/people">L'équipe</a>
			<a href="/legal">Informations légales</a>
		</div>
		<div class="column">
			<h2>Risques</h2>
			<a href="/risks">Aperçu des risques</a>
			<a href="/outcomes">Résultats de l'IA</a>
			<a href="/xrisk">Risque existentiel</a>
			<a href="/psychology-of-x-risk">La charge mentale des risques existentiels</a>
			<a href="/ai-takeover">Prise de contrôle de l'IA</a>
			<a href="/cybersecurity-risks">Etat de l'art</a>
		</div>
		<div class="column">
			<h2>Agir</h2>
			<a href="/join">Rejoindre PauseIA</a>
			<a href="/action">Comment pouvez-vous aider</a>
			<a href="/communities">Communautés locales</a>
			<a href="/donate">Faire un don</a>
			<ExternalLink href="https://pauseai-shop.fourthwall.com" target="_blank"
				>Marchandises</ExternalLink
			>
			<a href="/protests">Manifestations</a>
		</div>
		<div class="column">
			<h2>Autres</h2>
			<WithdrawWidgetConsent />
			<Toggle />
			<Edit />
			<!--
			<a href="/posts">All pages</a>
			<a href="/rss.xml" target="_blank">RSS</a>
			-->
			<ExternalLink href="https://creativecommons.org/licenses/by/4.0/" target="_blank"
				>License: CC-BY 4.0</ExternalLink
			>
			<ExternalLink
				href="https://airtable.com/appWPTGqZmUcs3NWu/pagIvo9Sv6IDHaolu/form"
				target="_blank">Soumettre un commentaire</ExternalLink
			>
		</div>
	</div>
</footer>

<style>
	footer {
		background-color: #ff9416;
		display: flex;
		padding: 6rem 6rem;
		gap: 5rem;
		overflow: hidden;
	}

	.footer-links {
		display: flex;
		gap: 2.5rem;
		font-size: 1.125;
	}

	@media (max-width: 750px) {
		footer {
			flex-direction: column;
			padding: 6rem 2rem;
		}
		.footer-links {
			flex-direction: column;
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
		font-size: 1.5rem;
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

	.logo p {
		margin-top: 1rem;
	}
</style>
