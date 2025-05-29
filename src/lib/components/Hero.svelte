<script lang="ts">
	import london from '$assets/protests/london.jpeg?enhanced'
	import denHaag from '$assets/protests/den-haag.jpeg?enhanced'
	import sf from '$assets/protests/san-francisco.jpeg?enhanced'
	import { onMount } from 'svelte'
	import { initializeCqwResizeObserver } from '$lib/container-query-units'
	import * as m from '$lib/paraglide/messages.js'
	import Link from '$lib/components/custom/a.svelte'

	let currentImageIndex = 0
	const images = [london, denHaag, sf]
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

		let observer: ResizeObserver | null = null
		if (!CSS.supports('container-type: inline-size')) {
			observer = initializeCqwResizeObserver(tagline)
		}

		return () => {
			clearInterval(interval)
			window.removeEventListener('resize', checkMobile)
			observer?.disconnect()
		}
	})
</script>

<div class="hero">
	{#if isMobile}
		{#each images as image, i}
			<enhanced:img src={image} sizes="100vw" alt="" class:active={currentImageIndex === i} />
		{/each}
	{:else}
		<enhanced:img src={london} sizes="100vw" alt="" />
		<enhanced:img src={denHaag} sizes="100vw" alt="" />
		<enhanced:img src={sf} sizes="100vw" alt="" />
	{/if}
	<div class="overlay"></div>
	<div class="tagline" bind:this={tagline}>
		<h2>{m.home_hero()}</h2>
	</div>
	<div class="actions">
		<Link href="/join">{m.header_join()}</Link>
		<Link href="/donate">{m.header_donate()}</Link>
	</div>
</div>

<style>
	.tagline {
		background-color: black;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: clamp(20rem, 45vw, 100%);
		container-type: inline-size;
		--cqw: 1cqw;
	}

	.tagline h2 {
		text-transform: uppercase;
		color: white;
		font-size: calc(8.75 * var(--cqw));
		text-align: center;
		margin: 0;
		padding: calc(6.5 * var(--cqw));
	}

	@media (max-width: 850px) {
		.tagline h2 {
			font-size: calc(8.5 * var(--cqw));
			padding: calc(7.5 * var(--cqw));
		}
	}

	.hero {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		height: 100vh;
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
		background-color: var(--brand);
		opacity: 0.8;
	}

	.actions {
		position: absolute;
		bottom: 10%;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 1rem;
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
		filter: blur(5px);
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
