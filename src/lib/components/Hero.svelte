<script lang="ts">
	import london from './../../assets/protests/london.jpeg'
	import denHaag from './../../assets/protests/den-haag.jpeg'
	import sf from './../../assets/protests/san-francisco.jpeg'
	import { onMount } from 'svelte'

	let currentImageIndex = 0
	const images = [london, denHaag, sf]
	let isMobile = false

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

		return () => {
			clearInterval(interval)
			window.removeEventListener('resize', checkMobile)
		}
	})
</script>

<div class="hero">
	{#if isMobile}
		{#each images as image, i}
			<img src={image} alt="" class:active={currentImageIndex === i} />
		{/each}
	{:else}
		<img src={london} alt="" />
		<img src={denHaag} alt="" />
		<img src={sf} alt="" />
	{/if}
	<div class="overlay"></div>
	<h2>DON'T LET AI COMPANIES <br />GAMBLE WITH OUR FUTURE</h2>
	<div class="actions">
		<a href="/join">Join</a>
		<a href="/donate">Donate</a>
	</div>
</div>

<style>
	/* nav if hero is present */
	:global(nav:nth-child(2)) {
		/* Move in front of hero */
		margin-top: -100vh;
		/* Don't stretch to next element */
		height: 0;
	}

	h2 {
		background-color: black;
		padding: 2rem;
		position: absolute;
		text-transform: uppercase;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-size: clamp(1.6rem, 4vw, 3rem);
		text-align: center;
	}

	@media (max-width: 768px) {
		h2 {
			transform: translate(-50%, -50%);
			width: 17rem;
			max-width: 100%;
			padding: 1.5rem;
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

	.actions a {
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

	.actions a:hover {
		scale: 1.05;
	}

	.actions a:active {
		scale: 0.95;
	}

	img {
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

		img {
			position: absolute;
			opacity: 0;
			transition:
				opacity 1s ease-in-out,
				transform 10s ease-in-out;
			transform: scale(1.1);
		}

		img.active {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
