<script lang="ts">
	import ExternalLink from '$lib/components/custom/a.svelte'
	import Toggle from '$lib/components/Toggle.svelte'
	import Edit from '$lib/components/Edit.svelte'
	import WithdrawWidgetConsent from '$lib/components/widget-consent/WithdrawWidgetConsent.svelte'
	import Socials from '$lib/components/Socials.svelte'
</script>

<footer>
	<div className="logo">
		<svg
			width="322"
			height="66"
			viewBox="0 0 322 66"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M66 33C66 51.2254 51.2254 66 33 66C14.7746 66 0 51.2254 0 33C0 14.7746 14.7746 0 33 0C51.2254 0 66 14.7746 66 33ZM20.7902 18.8101H29.0402V48.1801H20.7902V18.8101ZM44.5504 18.8101H36.3004V48.1801H44.5504V18.8101Z"
				fill="black"
			/>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M66 33C66 51.2254 51.2254 66 33 66C14.7746 66 0 51.2254 0 33C0 14.7746 14.7746 0 33 0C51.2254 0 66 14.7746 66 33ZM20.7902 18.8101H29.0402V48.1801H20.7902V18.8101ZM44.5504 18.8101H36.3004V48.1801H44.5504V18.8101Z"
				fill="black"
			/>
			<path
				d="M83 46.64V18.64H96.48C99.0934 18.64 101.347 19.0667 103.24 19.92C105.16 20.7733 106.64 22 107.68 23.6C108.72 25.1733 109.24 27.04 109.24 29.2C109.24 31.36 108.72 33.2267 107.68 34.8C106.64 36.3733 105.16 37.6 103.24 38.48C101.347 39.3333 99.0934 39.76 96.48 39.76H88.24L92.44 35.72V46.64H83ZM92.44 36.76L88.24 32.48H95.88C97.1867 32.48 98.1467 32.1867 98.76 31.6C99.4 31.0133 99.72 30.2133 99.72 29.2C99.72 28.1867 99.4 27.3867 98.76 26.8C98.1467 26.2133 97.1867 25.92 95.88 25.92H88.24L92.44 21.64V36.76ZM107.89 46.64L120.13 18.64H129.41L141.65 46.64H131.89L122.85 23.12H126.53L117.49 46.64H107.89ZM115.17 41.76L117.57 34.96H130.45L132.85 41.76H115.17ZM155.971 47.28C151.677 47.28 148.331 46.12 145.931 43.8C143.531 41.48 142.331 38.2267 142.331 34.04V18.64H151.771V33.76C151.771 35.8933 152.157 37.4133 152.931 38.32C153.704 39.2 154.744 39.64 156.051 39.64C157.384 39.64 158.424 39.2 159.171 38.32C159.944 37.4133 160.331 35.8933 160.331 33.76V18.64H169.611V34.04C169.611 38.2267 168.411 41.48 166.011 43.8C163.611 46.12 160.264 47.28 155.971 47.28ZM184.378 47.28C182.031 47.28 179.764 47.0133 177.578 46.48C175.391 45.9467 173.591 45.2533 172.178 44.4L175.218 37.52C176.551 38.2933 178.031 38.92 179.658 39.4C181.311 39.8533 182.911 40.08 184.458 40.08C185.364 40.08 186.071 40.0267 186.578 39.92C187.111 39.7867 187.498 39.6133 187.738 39.4C187.978 39.16 188.098 38.88 188.098 38.56C188.098 38.0533 187.818 37.6533 187.258 37.36C186.698 37.0667 185.951 36.8267 185.018 36.64C184.111 36.4267 183.111 36.2133 182.018 36C180.924 35.76 179.818 35.4533 178.698 35.08C177.604 34.7067 176.591 34.2133 175.658 33.6C174.751 32.9867 174.018 32.1867 173.458 31.2C172.898 30.1867 172.618 28.9333 172.618 27.44C172.618 25.7067 173.098 24.1333 174.058 22.72C175.044 21.28 176.498 20.1333 178.418 19.28C180.364 18.4267 182.778 18 185.658 18C187.551 18 189.418 18.2 191.258 18.6C193.098 19 194.751 19.6133 196.218 20.44L193.378 27.28C191.991 26.5867 190.644 26.0667 189.338 25.72C188.058 25.3733 186.804 25.2 185.578 25.2C184.671 25.2 183.951 25.28 183.418 25.44C182.884 25.6 182.498 25.8133 182.258 26.08C182.044 26.3467 181.938 26.64 181.938 26.96C181.938 27.44 182.218 27.8267 182.778 28.12C183.338 28.3867 184.071 28.6133 184.978 28.8C185.911 28.9867 186.924 29.1867 188.018 29.4C189.138 29.6133 190.244 29.9067 191.338 30.28C192.431 30.6533 193.431 31.1467 194.338 31.76C195.271 32.3733 196.018 33.1733 196.578 34.16C197.138 35.1467 197.418 36.3733 197.418 37.84C197.418 39.5467 196.924 41.12 195.938 42.56C194.978 43.9733 193.538 45.12 191.618 46C189.698 46.8533 187.284 47.28 184.378 47.28ZM208.867 29.04H221.347V35.84H208.867V29.04ZM209.507 39.52H223.507V46.64H200.227V18.64H222.987V25.76H209.507V39.52Z"
				fill="black"
			/>
			<path
				d="M241 46L253.24 18H262.52L274.76 46H265L255.96 22.48H259.64L250.6 46H241ZM248.28 41.12L250.68 34.32H263.56L265.96 41.12H248.28ZM276.266 46V18H285.706V46H276.266Z"
				fill="black"
			/>
		</svg>
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
			<a href="donate">Faire un don</a>
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
		gap: 3rem;
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
</style>
