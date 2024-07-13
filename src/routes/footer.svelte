<script lang="ts">
	import ExternalLink from '$lib/components/custom/a.svelte'
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
			<a href="/propositions">Propositions</a>
		</div>
		<div class="column">
			<h2>Risques</h2>
			<a href="/risques/objets-et-economie">Objets et économie</a>
			<a href="/risques/individus">Individus</a>
			<a href="/risques/civilisation-et-information">Civilisation et information</a>
			<a href="/risques/humanite">Humanité</a>
		</div>
		<div class="column">
			<h2>Agir</h2>
			<a href="/nous-rejoindre">Rejoindre PauseIA</a>
			<a href="/agir">Comment pouvez-vous aider</a>
			<a href="/dons">Faire un don</a>
			<ExternalLink href="https://pauseai-shop.fourthwall.com" target="_blank"
				>Marchandises</ExternalLink
			>
			<a href="https://pauseai.info/protests">Manifestations</a>
		</div>
		<div class="column">
			<h2>Autres</h2>
			<a href="/mentions-legales">Mentions légales</a>
			<ExternalLink href="https://creativecommons.org/licenses/by/4.0/" target="_blank"
				>License: CC-BY 4.0</ExternalLink
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
