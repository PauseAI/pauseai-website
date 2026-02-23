<script lang="ts">
	import homeHeroDesktop from '$assets/protests/Home Hero - web - No Background.png?enhanced'
	import homeHeroMobile from '$assets/protests/Home Hero - mobile - No Background.png?enhanced'
	import { onMount } from 'svelte'
	import { emulateCqwIfNeeded } from '$lib/container-query-units'

	import Link from '$lib/components/Link.svelte'

	let tagline: HTMLDivElement

	onMount(() => {
		const cleanupCqwEmulation = emulateCqwIfNeeded(tagline)

		return () => {
			cleanupCqwEmulation?.()
		}
	})
</script>

<div class="hero">
	<picture>
		{#each Object.entries(homeHeroMobile.sources) as [format, srcset]}
			<source media="(max-width: 850px)" {srcset} sizes="100vw" type={'image/' + format} />
		{/each}
		{#each Object.entries(homeHeroDesktop.sources) as [format, srcset]}
			<source {srcset} sizes="100vw" type={'image/' + format} />
		{/each}
		<img src={homeHeroDesktop.img.src} alt="" />
	</picture>
	<div class="content" bind:this={tagline}>
		<h2>Don't let AI companies<br />gamble away our future</h2>
		<div class="actions">
			<Link href="/join" class="btn-primary">Get involved</Link>
			<Link href="/donate" class="btn-secondary">Donate</Link>
		</div>
	</div>
</div>

<style>
	.content {
		position: absolute;
		top: 45%;
		left: 20%;
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

	.hero :global(img) {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: min(100%, calc(max(100vh, var(--hero-min-height)) * var(--hero-img-ar)));
		height: auto;
		mix-blend-mode: soft-light;
		-webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
		mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
	}

	@media (min-width: 851px) {
		.hero :global(img) {
			transform-origin: center bottom;
			transform: translateX(-50%) scale(0.95);
		}
	}

	@media (max-width: 850px) {
		.hero :global(img) {
			bottom: var(--mobile-hero-img-pos, 0px);
		}

		.content {
			top: auto;
			bottom: 5vh;
			left: 50%;
			transform: translateX(-50%);
			width: 90%;
			text-align: center;
			align-items: center;
			z-index: 1;
		}

		.content h2 {
			font-size: calc(9 * var(--cqw));
			text-align: center;
		}

		.actions {
			justify-content: center;
		}

		.actions :global(a.btn-primary),
		.actions :global(a.btn-secondary) {
			background-color: transparent;
			backdrop-filter: blur(2px);
			border: 2px solid white;
			color: white;
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
		background-color: #ff9416;
		isolation: isolate;

		/* Adjust this to push the mobile image up or down (e.g., 0px, 10vh, -20px) */
		--mobile-hero-img-pos: 215px;
		/* Desktop hero image aspect ratio (2880 / 1600) — update if image changes */
		--hero-img-ar: 1.8;
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
</style>
