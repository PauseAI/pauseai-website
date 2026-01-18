<script lang="ts">
	import mashupDesktop from '$assets/protests/mashup_desktop.jpg?enhanced'
	import mashupMobile from '$assets/protests/mashup_mobile.jpg?enhanced'
	import { onMount } from 'svelte'
	import { emulateCqwIfNeeded } from '$lib/container-query-units'

	import Link from '$lib/components/Link.svelte'

	let isMobile = false
	let tagline: HTMLDivElement

	const checkMobile = () => {
		isMobile = window.innerWidth <= 768
	}

	onMount(() => {
		checkMobile()
		window.addEventListener('resize', checkMobile)

		const cleanupCqwEmulation = emulateCqwIfNeeded(tagline)

		return () => {
			window.removeEventListener('resize', checkMobile)
			cleanupCqwEmulation?.()
		}
	})
</script>

<div class="hero">
	{#if isMobile}
		<enhanced:img src={mashupMobile} sizes="100vw" alt="" />
	{:else}
		<enhanced:img src={mashupDesktop} sizes="100vw" alt="" />
	{/if}
	<div class="overlay"></div>
	<div class="content" bind:this={tagline}>
		<h2>Don’t let AI companies<br />gamble away our future</h2>
		<div class="actions">
			<Link href="/join" class="btn-primary">Get involved</Link>
			<Link href="/donate" class="btn-secondary">Donate</Link>
		</div>
	</div>
</div>

<style>
	.content {
		position: absolute;
		top: 50%;
		left: 10%; /* Left aligned */
		transform: translateY(-50%);
		width: clamp(20rem, 60vw, 100%);
		container-type: inline-size;
		--cqw: 1cqw;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.content h2 {
		color: white;
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: calc(6 * var(--cqw));
		line-height: 1.1;
		text-align: left;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	@media (max-width: 850px) {
		.content {
			left: 5%;
			width: 90%;
		}

		.content h2 {
			font-size: calc(8 * var(--cqw));
		}
	}

	.hero {
		display: block;
		height: 100vh;
		min-height: var(--hero-min-height);
		overflow: hidden;
		position: relative;
		width: 100vw;
		left: 50%;
		transform: translateX(-50%);
		background-color: white;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0.75;
		background-color: var(--brand);
		/*background: linear-gradient(90deg, var(--brand) 0%, rgba(252, 151, 0, 0.4) 100%);*/
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-start;
	}

	/* Global styles for Link component when used here */
	.actions :global(a) {
		font-family: var(--font-heading);
		text-decoration: none;
		font-size: 1rem;
		padding: 0.6rem 1.6rem;
		text-transform: uppercase;
		transition: scale 0.1s;
		cursor: pointer;
		border-radius: 4px; /* Slight rounding if desired, or keep square */
		font-weight: bold;
		display: inline-block;
		text-align: center;
	}

	.actions :global(a.btn-primary) {
		background-color: #1a1a1a; /* Dark button */
		color: white;
		border: 2px solid #1a1a1a;
	}

	.actions :global(a.btn-secondary) {
		background-color: white;
		color: black;
		border: 2px solid white;
	}

	.actions :global(a:hover) {
		scale: 1.05;
	}

	.actions :global(a:active) {
		scale: 0.95;
	}

	.hero :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1) translateX(150px);
	}
</style>
