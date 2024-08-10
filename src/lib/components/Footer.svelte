<script lang="ts">
	import ExternalLink from '$components/custom/a.svelte'
	import Logo from '$components/Logo.svelte'
	import Socials from '$components/Socials.svelte'
</script>

<footer>
	<div class="brand">
		<a href="/" class="logo">
			<div class="logo">
				<Logo animate fill_circle="white" fill_ai="white" />
			</div>
		</a>
		<p>Pour une IA alignée sur l’humanité.</p>
	</div>
	<div class="socials">
		<h2>Suivez-nous</h2>
		<Socials />
	</div>
	<div class="footer-links">
		<div class="column">
			<h2>Navigation</h2>
			<a href="/faq">FAQ</a>
			<a href="/dangers">Dangers</a>
			<a href="/propositions">Propositions</a>
			<a href="/agir">Agir</a>
			<a href="https://pauseia.substack.com/">Blog</a>
			<a href="/dons">Dons</a>
			<a href="/nous-rejoindre">Nous rejoindre</a>
		</div>
		<div class="column">
			<h2>Dangers</h2>
			<a href="/dangers/economiques-et-materiels">Économiques et matériels</a>
			<a href="/dangers/pour-les-individus">Pour les individus</a>
			<a href="/dangers/pour-la-societe">Pour la société</a>
			<a href="/dangers/pour-l'humanite">Pour l'humanité</a>
		</div>
		<div class="column">
			<h2>Agir</h2>
			<a href="/nous-rejoindre">Rejoindre Pause IA</a>
			<a href="/agir">Comment pouvez-vous aider ?</a>
			<a href="/dons">Faire un don</a>
			<ExternalLink href="https://pauseai-shop.fourthwall.com" target="_blank"
				>Marchandises</ExternalLink
			>
			<a href="https://pauseai.info/protests">Manifestations</a>
		</div>
		<div class="column">
			<h2>Autres</h2>
			<a href="/mentions-legales">Mentions légales</a>
			<a href="/politique-de-confidentialite">Politique de confidentialité</a>
			<ExternalLink href="https://creativecommons.org/licenses/by/4.0/deed.fr" target="_blank"
				>Licence: CC-BY 4.0</ExternalLink
			>
		</div>
	</div>
</footer>

<style>
	footer {
		background-color: #ff9416;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		overflow: hidden;
		padding: 2rem;
	}

	.logo {
		height: 66px;
	}

	.socials {
		display: flex;
		flex-direction: column;
		align-items: start;
	}

	.footer-links {
		display: flex;
		gap: 2.5rem;
		flex-direction: column;
	}

	.brand,
	.socials,
	.column {
		gap: 0.5rem;
	}

	.column {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	h2 {
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

	.brand p {
		margin-top: 1rem;
		margin-bottom: 0;
		text-align: center;
		font-style: italic;
	}
	@media (min-width: 480px) {
		.footer-links {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(2, 1fr);
		}
	}
	@media (min-width: 768px) {
		footer {
			padding: 4rem 6rem;
			display: grid;
			gap: 3rem;
			grid-template-columns: minmax(1rem, auto) 1fr;
		}

		.brand {
			grid-column: 1;
			grid-row: 1;
		}

		.logo {
			height: fit-content;
		}

		.socials {
			grid-column: 2;
			grid-row: 1;
			align-items: center;
		}

		.footer-links {
			display: flex;
			grid-column: 1 / -1;
			grid-row: 2;
			flex-direction: row;
		}
	}
	@media (min-width: 1280px) {
		footer {
			padding: 6rem;
			grid-template-columns: minmax(1rem, auto) repeat(2, 1fr);
			grid-template-rows: 1fr;
			gap: 3rem;
		}
		.brand,
		.socials,
		.footer-links {
			grid-column: auto;
			grid-row: unset;
		}
	}
</style>
