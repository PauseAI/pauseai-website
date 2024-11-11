<script>
	import QuoteContent from './QuoteContent.svelte'
	import Hinton from '../../assets/quote-profile/hinton.jpg?enhanced'
	import Hawking from '../../assets/quote-profile/hawking.jpg?enhanced'
	import Turing from '../../assets/quote-profile/turing.jpg?enhanced'
	import Russell from '../../assets/quote-profile/russell.jpg?enhanced'
	import Bengio from '../../assets/quote-profile/bengio.jpg?enhanced'

	let currentSlide = 0

	const quotes = [
		{
			text: 'If you take the existential risk seriously, as I now do, it might be quite sensible to just stop developing these things any further.',
			author: 'Geoffrey Hinton',
			title: 'Nobel Prize winner & "Godfather of AI"',
			image: Hinton
		},
		{
			text: 'The development of full artificial intelligence could spell the end of the human race.',
			author: 'Stephen Hawking',
			title: 'Theoretical physicist and cosmologist',
			image: Hawking
		},
		{
			text: '... we should have to expect the machines to take control.',
			author: 'Alan Turing',
			title: 'Inventor of the modern computer',
			image: Turing
		},
		{
			text: 'If we pursue [our current approach], then we will eventually lose control over the machines',
			author: 'Stuart Russell',
			title: 'Writer of the AI textbook',
			image: Russell
		},
		{
			text: 'Rogue AI may be dangerous for the whole of humanity. Banning powerful AI systems (say beyond the abilities of GPT-4) that are given autonomy and agency would be a good start.',
			author: 'Yoshua Bengio',
			title: 'AI Turing Award winner',
			image: Bengio
		}
	]

	const totalSlides = quotes.length

	function nextSlide() {
		currentSlide = (currentSlide + 1) % totalSlides
	}

	function prevSlide() {
		currentSlide = (currentSlide - 1 + totalSlides) % totalSlides
	}
</script>

<!-- Preload images -->
<div style="width: 0; height: 0; opacity: 0; pointer-events: none;">
	{#each quotes as quote}
		<enhanced:img src={quote.image} width="0" height="0" />
	{/each}
</div>

<div class="quote-container">
	<QuoteContent quote={quotes[currentSlide]} />

	<div class="navigation">
		<button on:click={prevSlide} class="nav-button">←</button>
		{#each Array(totalSlides) as _, i}
			<div class="dot" class:active={currentSlide === i}></div>
		{/each}
		<button on:click={nextSlide} class="nav-button">→</button>
		<a href="/quotes">See all quotes</a>
	</div>
</div>

<style>
	.quote-container {
	}

	.navigation {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.navigation a {
		color: var(--brand);
		font-size: 0.875rem;
		text-decoration: none;
	}

	.navigation a:hover {
		color: var(--brand-subtle);
	}

	.nav-button {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.5rem;
		opacity: 0.5;
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
	}
</style>
