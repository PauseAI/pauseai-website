<script lang="ts">
	import ASI_Statement from '$assets/quote-profile/asi_statement.jpg?enhanced'
	import Bengio from '$assets/quote-profile/bengio.jpg?enhanced'
	import CAIS from '$assets/quote-profile/cais_statement.jpg?enhanced'
	import Hawking from '$assets/quote-profile/hawking.jpg?enhanced'
	import Hinton from '$assets/quote-profile/hinton.jpg?enhanced'
	import Russell from '$assets/quote-profile/russell.jpg?enhanced'
	import Turing from '$assets/quote-profile/turing.jpg?enhanced'
	import Link from '$lib/components/Link.svelte'
	import * as m from '$lib/paraglide/messages'
	import type { CarouselQuote } from '$lib/types'
	import '@glidejs/glide/dist/css/glide.core.css'
	import Glide, {
		Autoplay,
		Controls,
		Images,
		Keyboard,
		Swipe
	} from '@glidejs/glide/dist/glide.modular.esm'
	import ArrowLeft from 'lucide-svelte/icons/arrow-left'
	import ArrowRight from 'lucide-svelte/icons/arrow-right'
	import { onMount } from 'svelte'
	import QuoteContent from './QuoteContent.svelte'

	const AUTOPLAY_INTERVAL = 10_000

	let glide: Glide
	let currentSlide: number | null = null

	const quotes: CarouselQuote[] = [
		{
			text: m.home_quotes_asi_statement_text(),
			author: m.home_quotes_asi_statement_author(),
			title: m.home_quotes_asi_statement_title(),
			image: ASI_Statement,
			href: 'https://superintelligence-statement.org/'
		},
		{
			text: m.home_quotes_cais_text(),
			author: m.home_quotes_cais_author(),
			title: m.home_quotes_cais_title(),
			image: CAIS,
			href: 'https://www.theguardian.com/technology/2023/may/30/risk-of-extinction-by-ai-should-be-global-priority-say-tech-experts'
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
			image: Hawking,
			href: 'https://www.bbc.com/news/technology-30290540'
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
	})
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
	</div>
	<div class="navigation" data-glide-el="controls">
		<button class="nav-button" data-glide-dir="<" aria-label="Previous slide"
			><ArrowLeft size="1em" /></button
		>
		{#each Array(totalSlides) as _, i}
			<button
				class="dot reset-button"
				class:active={currentSlide === i}
				data-glide-dir={`=${i}`}
				aria-label={`Go to slide ${i + 1}`}
			></button>
		{/each}
		<button class="nav-button" data-glide-dir=">" aria-label="Next slide"
			><ArrowRight size="1em" /></button
		>
		<Link href="/quotes">{m.home_quotes_all()}</Link>
	</div>
</div>

<style>
	.glide__track {
		position: relative;
		inset: -20px;
	}

	.quote {
		margin: 20px;
	}

	.glide__slides {
		overflow: unset;
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
