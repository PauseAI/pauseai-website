<script lang="ts">
	import Link from '$lib/components/Link.svelte'
	import Toggle from '$lib/components/Toggle.svelte'
	import Socials from '$lib/components/Socials.svelte'
	import * as m from '$lib/paraglide/messages.js'
</script>

<footer>
	<div class="joinbar">
		<Link class="c2a" href="https://pauseai.info/join">{m.footer_join()}</Link>
		<div class="socials">
			<Socials />
		</div>
	</div>
	<div class="bar" />
	<div class="footer-links">
		<div class="column">
			<h2>{m.footer_info()}</h2>
			<Link href="/nosotros">Nosotros</Link>
			<Link href="/pausa">La pausa</Link>
			<Link href="/debate">IA con ñ</Link>
			<Link href="/privacy">{m.footer_info_privacy()}</Link>
			<Link href="/legal">{m.footer_info_legal()}</Link>
		</div>
		<div class="column">
			<h2>{m.footer_action()}</h2>
			<Link href="/inscripcion">{m.footer_action_join()}</Link>
			<Link href="/protesters-code-of-conduct">Código de conducta</Link>
			<Link href="/donate">{m.footer_action_donate()}</Link>
			<Link href="https://pauseai-shop.fourthwall.com" target="_blank"
				>{m.footer_action_merchandise()}</Link
			>
			<Link href="/lobby-tips">{m.footer_action_lobby()}</Link>
		</div>
		<div class="column">
			<h2>{m.footer_other()}</h2>
			<Toggle />
			<Link href="https://creativecommons.org/licenses/by/4.0/" target="_blank"
				>{m.footer_other_license()}</Link
			>
		</div>
	</div>
	<div class="attribution">
		<p>{@html m.footer_attribution_html()}</p>
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
		grid-template-columns: repeat(3, 1fr);
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

	.attribution {
		font-size: 0.75rem;
		color: var(--text-3, var(--text-2));
		line-height: 1.4;
		margin-bottom: 1.5rem;
	}

	.attribution :global(a) {
		color: inherit;
		font-weight: 600;
		text-decoration: underline;
		text-decoration-thickness: 1px;
	}
</style>
