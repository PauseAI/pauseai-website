<script>
	import QuoteContent from './QuoteContent.svelte'

	let currentSlide = 0

	const quotes = [
		{
			text: 'If you take the existential risk seriously, as I now do, it might be quite sensible to just stop developing these things any further.',
			author: 'prof. Geoffrey Hinton',
			title: 'Nobel prize winner & Godfather of AI'
		},
		{
			text: 'The development of full artificial intelligence could spell the end of the human race.',
			author: 'prof. Stephen Hawking',
			title: 'Theoretical physicist and cosmologist'
		},
		{
			text: '... we should have to expect the machines to take control.',
			author: 'prof. Alan Turing',
			title: 'Inventor of the modern computer'
		},
		{
			text: "The robot is not going to want to be switched off because you've given it a goal to achieve and being switched off is a way of failing—so it will do its best not to be switched off.",
			author: 'prof. Stuart Russell',
			title: 'Writer of the AI textbook'
		},
		{
			text: 'It’s very challenging psychologically to realize that what you’ve been working for, with the idea that it would be a great thing—for society, for humanity, for science—may actually be catastrophic.',
			author: 'prof. Yoshua Bengio',
			title: 'AI Turing Award winner'
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

<div class="quote-container">
	<QuoteContent quote={quotes[currentSlide]} />

	<div class="navigation">
		<button on:click={prevSlide} class="nav-button">←</button>
		{#each Array(totalSlides) as _, i}
			<div class="dot" class:active={currentSlide === i}></div>
		{/each}
		<button on:click={nextSlide} class="nav-button">→</button>
	</div>
</div>

<style>
	.quote-container {
		margin-bottom: 5rem;
	}

	.quote-container::after {
		content: '';
		display: block;
		height: 0.1rem;
		margin: 2rem 0;
		background: var(--bg-subtle);
		width: 100%;
	}

	.navigation {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
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
