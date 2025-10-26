<script lang="ts">
	import denHaag from '$assets/protests/den-haag.jpeg?enhanced'
	import { onMount } from 'svelte'
	import { emulateCqwIfNeeded } from '$lib/container-query-units'
	import * as m from '$lib/paraglide/messages.js'
	import Link from '$lib/components/Link.svelte'

	let currentImageIndex = 0
	const images = [denHaag]
	let isMobile = false
	let tagline: HTMLDivElement

	const checkMobile = () => {
		isMobile = window.innerWidth <= 768
	}

	onMount(() => {
		checkMobile()
		window.addEventListener('resize', checkMobile)

		// Switch images every 5 seconds
		const interval = setInterval(() => {
			if (isMobile) {
				currentImageIndex = (currentImageIndex + 1) % images.length
			}
		}, 5000)

		const cleanupCqwEmulation = emulateCqwIfNeeded(tagline)

		return () => {
			clearInterval(interval)
			window.removeEventListener('resize', checkMobile)
			cleanupCqwEmulation?.()
		}
	})
</script>

<div class="hero">
	{#if isMobile}
		{#each images as image, i}
			<enhanced:img src={image} sizes="100vw" alt="" class:active={currentImageIndex === i} />
		{/each}
	{:else}
		<enhanced:img src={denHaag} sizes="100vw" alt="" />
	{/if}
	<div class="overlay"></div>
	<div class="tagline" bind:this={tagline}>
		<h2>{m.home_hero()}</h2>
		<p>
			Desde España e Hispanoamérica, nos sumamos a la iniciativa de la organización internacional
			PauseAI para pausar el desarrollo de la inteligencia artificial avanzada
		</p>
		<div class="actions">
			<Link href="/inscripcion">{m.header_join()}</Link>
			<Link href="/donate">{m.header_donate()}</Link>
		</div>
	</div>
</div>

<style>
	.tagline {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		font-size: 20px;
		container-type: inline-size;
		--cqw: 1cqw;
	}

	.tagline h2 {
		text-transform: uppercase;
		color: white;
		font-size: calc(3.5 * var(--cqw));
		margin: 0;
		text-align: center;
		padding: calc(3.5 * var(--cqw));
		padding-bottom: calc(0.5 * var(--cqw));
		padding-top: calc(0.5 * var(--cqw));
	}

	.tagline p {
		color: white;
		margin: 0;
		font-size: calc(2 * var(--cqw));
		padding: calc(3.5 * var(--cqw));
	}

	@media (max-width: 850px) {
		.tagline {
			position: absolute;
			top: 30%;
			left: 50%;
			transform: translate(-50%, -30%);
			width: 100%;
			font-size: 20px;
			container-type: inline-size;
			--cqw: 1cqw;
		}

		.tagline h2 {
			font-size: calc(10 * var(--cqw));
			padding: calc(7.5 * var(--cqw));
			padding-top: calc(3 * var(--cqw));
		}

		.tagline p {
			color: white;
			margin: 0;
			padding-left: calc(7.5 * var(--cqw));
			padding-right: calc(7.5 * var(--cqw));
			font-size: calc(6.5 * var(--cqw));
		}
	}

	.hero {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		height: calc(100vh - 3rem);
		overflow: hidden;
		position: relative;
		max-width: 100vw;
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #000000;
		opacity: 0.7;
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.actions :global(a) {
		background-color: white;
		font-family: var(--font-heading);
		text-decoration: none;
		font-size: 1.2rem;
		color: black;
		padding: 1rem 2rem;
		text-transform: uppercase;
		transition: scale 0.1s;
		cursor: pointer;
	}

	.actions :global(a:hover) {
		scale: 1.05;
	}

	.actions :global(a:active) {
		scale: 0.95;
	}

	.hero :global(img) {
		/* 2x the blur */
		width: calc(100% + 10px);
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 768px) {
		.hero {
			display: block;
		}

		.hero :global(img) {
			position: absolute;
			opacity: 0;
			transition:
				opacity 1s ease-in-out,
				transform 10s ease-in-out;
			transform: scale(1.1);
		}

		.hero :global(img.active) {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
