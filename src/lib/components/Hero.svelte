<script lang="ts">
	import deepmind from '$assets/protests/[Downsized] June 2025 DeepMind.jpg?enhanced'
	import sf from '$assets/protests/[Downsized] San Francisco.jpeg?enhanced'
	import denHaag from '$assets/protests/[Downsized] September 2023 Den Haag.jpg?enhanced'
	import { onMount } from 'svelte'
	import * as m from '$lib/paraglide/messages.js'
	import Link from '$lib/components/Link.svelte'
	import ChevronDown from 'lucide-svelte/icons/chevron-down'

	let currentImageIndex = 0
	const images = [deepmind, sf, denHaag]
	let mounted = false

	onMount(() => {
		mounted = true

		const interval = setInterval(() => {
			currentImageIndex = (currentImageIndex + 1) % images.length
		}, 6000)

		return () => clearInterval(interval)
	})

	function scrollToContent() {
		window.scrollTo({
			top: window.innerHeight,
			behavior: 'smooth'
		})
	}
</script>

<div class="hero" class:mounted>
	<div class="images">
		{#each images as image, i}
			<enhanced:img
				src={image}
				sizes="100vw"
				alt="PauseAI protest"
				class:active={currentImageIndex === i}
			/>
		{/each}
	</div>

	<div class="overlay"></div>

	<div class="content">
		<h1 class="headline">{m.home_hero()}</h1>

		<div class="actions">
			<Link href="/join" class="btn btn-primary">{m.header_join()}</Link>
			<Link href="/action" class="btn btn-secondary">Take Action</Link>
		</div>
	</div>

	<button class="scroll-indicator" on:click={scrollToContent} aria-label="Scroll to content">
		<ChevronDown size={32} />
	</button>

	<div class="image-indicators">
		{#each images as _, i}
			<button
				class="indicator"
				class:active={currentImageIndex === i}
				on:click={() => (currentImageIndex = i)}
				aria-label={`View image ${i + 1}`}
			/>
		{/each}
	</div>
</div>

<style>
	.hero {
		position: relative;
		height: calc(100vh - 5rem);
		min-height: 500px;
		width: 100vw;
		left: 50%;
		transform: translateX(-50%);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.images {
		position: absolute;
		inset: 0;
	}

	.images :global(img) {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		opacity: 0;
		transition: opacity 1.5s ease-in-out;
	}

	.images :global(img.active) {
		opacity: 1;
	}

	.overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			rgba(0, 0, 0, 0.55) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(255, 148, 22, 0.3) 100%
		);
	}

	.content {
		position: relative;
		z-index: 1;
		text-align: center;
		padding: 2rem;
		max-width: 900px;
		opacity: 0;
		transform: translateY(30px);
		transition:
			opacity 0.8s ease-out,
			transform 0.8s ease-out;
	}

	.mounted .content {
		opacity: 1;
		transform: translateY(0);
	}

	.headline {
		font-size: clamp(2.5rem, 8vw, 4.5rem);
		font-weight: 700;
		color: white;
		text-transform: uppercase;
		margin: 0 0 1.5rem 0;
		line-height: 1.05;
		letter-spacing: 0.02em;
		text-shadow:
			0 2px 4px rgba(0, 0, 0, 0.9),
			0 4px 12px rgba(0, 0, 0, 0.7),
			0 8px 30px rgba(0, 0, 0, 0.5);
	}

	.headline::after {
		content: '';
		display: block;
		width: 80px;
		height: 4px;
		background: var(--brand);
		margin: 1.5rem auto 0;
	}

	.actions {
		display: flex;
		gap: 1.25rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.actions :global(.btn) {
		font-family: var(--font-heading);
		text-decoration: none;
		font-size: 1rem;
		padding: 0.9rem 2.2rem;
		text-transform: uppercase;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		font-weight: 700;
		letter-spacing: 0.05em;
		border-radius: 3px;
	}

	.actions :global(.btn-primary) {
		background: linear-gradient(135deg, var(--brand) 0%, #e8850f 100%);
		color: white;
		border: none;
		box-shadow: 0 4px 15px rgba(255, 148, 22, 0.3);
	}

	.actions :global(.btn-primary:hover) {
		background: linear-gradient(135deg, #ffaa3d 0%, var(--brand) 100%);
		transform: translateY(-3px);
		box-shadow: 0 6px 25px rgba(255, 148, 22, 0.45);
	}

	.actions :global(.btn-secondary) {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(4px);
	}

	.actions :global(.btn-secondary:hover) {
		background: white;
		color: #222;
		border-color: white;
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
	}

	.scroll-indicator {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		opacity: 0.7;
		transition:
			opacity 0.2s,
			transform 0.2s;
		animation: bounce 2s infinite;
	}

	.scroll-indicator:hover {
		opacity: 1;
	}

	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateX(-50%) translateY(0);
		}
		40% {
			transform: translateX(-50%) translateY(-10px);
		}
		60% {
			transform: translateX(-50%) translateY(-5px);
		}
	}

	.image-indicators {
		position: absolute;
		bottom: 2rem;
		right: 2rem;
		display: flex;
		gap: 0.5rem;
	}

	.indicator {
		width: 40px;
		height: 4px;
		border: none;
		background: rgba(255, 255, 255, 0.4);
		cursor: pointer;
		transition: all 0.3s ease;
		padding: 0;
	}

	.indicator:hover {
		background: rgba(255, 255, 255, 0.7);
	}

	.indicator.active {
		background: var(--brand);
	}

	/* Mobile */
	@media (max-width: 768px) {
		.hero {
			min-height: 100svh;
		}

		.content {
			padding: 1.5rem;
		}

		.actions {
			flex-direction: column;
			align-items: center;
		}

		.actions :global(.btn) {
			width: 100%;
			max-width: 280px;
			text-align: center;
		}

		.image-indicators {
			right: 50%;
			transform: translateX(50%);
			bottom: 5rem;
		}

		.scroll-indicator {
			bottom: 1rem;
		}
	}
</style>
