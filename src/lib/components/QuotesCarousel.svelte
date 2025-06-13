<script lang="ts">
	import QuoteContent from './QuoteContent.svelte'
	import Hinton from '$assets/quote-profile/hinton.jpg?enhanced'
	import Hawking from '$assets/quote-profile/hawking.jpg?enhanced'
	import Turing from '$assets/quote-profile/turing.jpg?enhanced'
	import Russell from '$assets/quote-profile/russell.jpg?enhanced'
	import Bengio from '$assets/quote-profile/bengio.jpg?enhanced'
	import CAIS from '$assets/quote-profile/cais_statement.jpg?enhanced'
	import ArrowLeft from 'lucide-svelte/icons/arrow-left'
	import ArrowRight from 'lucide-svelte/icons/arrow-right'
	import Glide, {
		Autoplay,
		Controls,
		Images,
		Keyboard,
		Swipe
	} from '@glidejs/glide/dist/glide.modular.esm'
	import '@glidejs/glide/dist/css/glide.core.css'
	import { onMount } from 'svelte'
	import * as m from '$lib/paraglide/messages'
	import Link from '$lib/components/custom/a.svelte'

	const MOBILE_NAVIGATION_DISTANCE_THRESHOLD = 10
	const AUTOPLAY_INTERVAL = 10_000

	let glide: Glide
	let currentSlide: number | null = null

	const quotes = [
		{
			text: m.home_quotes_cais_text(),
			author: m.home_quotes_cais_author(),
			title: m.home_quotes_cais_title(),
			image: CAIS
		},
		{
			text: m.home_quotes_hinton_text(),
			author: 'Geoffrey Hinton',
			title: m.home_quotes_hinton_title(),
			image: Hinton
		},
		{
			text: m.home_quotes_hawking_text(),
			author: 'Stephen Hawking',
			title: m.home_quotes_hawking_title(),
			image: Hawking
		},
		{
			text: m.home_quotes_turing_text(),
			author: 'Alan Turing',
			title: m.home_quotes_turing_title(),
			image: Turing
		},
		{
			text: m.home_quotes_russell_text(),
			author: 'Stuart Russell',
			title: m.home_quotes_russell_title(),
			image: Russell
		},
		{
			text: m.home_quotes_bengio_text(),
			author: 'Yoshua Bengio',
			title: m.home_quotes_bengio_title(),
			image: Bengio
		}
	]

	const totalSlides = quotes.length

	onMount(() => {
		glide = new Glide('.glide', {
			autoplay: AUTOPLAY_INTERVAL
		}).mount({ Controls, Images, Keyboard, Swipe, Autoplay })
		currentSlide = glide.index
		glide.on('move', () => {
			currentSlide = glide.index
		})
		registerMobileNavigation()
	})

	type ClientCoordinates = { clientX: number; clientY: number }
	let interactionStart: ClientCoordinates | null = null

	function registerMobileNavigation() {
		addEventListener('touchstart', (event) => (interactionStart = event.changedTouches[0]))
		addEventListener('mousedown', (event) => (interactionStart = event))

		const touchNavigationButtons = document.getElementsByClassName(
			'touch-navigation'
		) as HTMLCollectionOf<HTMLElement>
		window.addEventListener('click', (event) => {
			if (!interactionStart) return
			for (const touchNavigationButton of touchNavigationButtons) {
				const boundingClientRect = touchNavigationButton.getBoundingClientRect()
				if (
					isInside(event, boundingClientRect) &&
					calculateDistance(interactionStart, event) <= MOBILE_NAVIGATION_DISTANCE_THRESHOLD
				) {
					// HTMLElement#click bubbles, leading to recursion
					return touchNavigationButton.dispatchEvent(new Event('click'))
				}
			}
		})
	}

	function isInside({ clientX, clientY }: ClientCoordinates, rect: DOMRect) {
		return (
			clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
		)
	}

	function calculateDistance(from: ClientCoordinates, to: ClientCoordinates) {
		return Math.hypot(to.clientX - from.clientX, to.clientY - from.clientY)
	}
</script>

<div class="glide">
	<div class="glide__track" data-glide-el="track">
		<ul class="glide__slides">
			{#each quotes as quote}
				<li class="glide__slide">
					<div class="quote">
						<QuoteContent {quote} />
					</div>
				</li>
			{/each}
		</ul>
		<button class="reset-button touch-navigation left" on:click={() => glide.go('<')} />
		<button class="reset-button touch-navigation right" on:click={() => glide.go('>')} />
	</div>
	<div class="navigation" data-glide-el="controls">
		<button class="nav-button" data-glide-dir="<"><ArrowLeft size="1em" /></button>
		{#each Array(totalSlides) as _, i}
			<button class="dot reset-button" class:active={currentSlide === i} data-glide-dir={`=${i}`} />
		{/each}
		<button class="nav-button" data-glide-dir=">"><ArrowRight size="1em" /></button>
		<Link href="/quotes">{m.home_quotes_all()}</Link>
	</div>
</div>

<style>
	.glide__track {
		position: relative;
		margin: -20px;
	}

	.quote {
		margin: 20px;
	}

	.glide__slides {
		overflow: unset;
	}

	.touch-navigation {
		position: absolute;
		top: 0;
		width: 33%;
		height: 100%;
		pointer-events: none;
	}

	.touch-navigation.left {
		left: 0;
	}

	.touch-navigation.right {
		right: 0;
	}

	.navigation {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.navigation :global(a) {
		color: var(--brand);
		font-size: 0.875rem;
		text-decoration: none;
	}

	.navigation :global(a:hover) {
		color: var(--brand-subtle);
	}

	.nav-button {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.5rem;
		opacity: 0.5;
		color: inherit;
		display: flex;
		align-items: center;
	}

	.nav-button:hover {
		opacity: 1;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--bg-subtle);
		transition: background-color 0.3s ease;
	}

	.dot.active {
		background: var(--brand);
		transform: scale(1.2);
	}

	.dot:not(.active):hover {
		transform: scale(1.2);
	}
</style>
