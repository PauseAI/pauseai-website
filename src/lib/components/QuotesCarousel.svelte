<script>
	import QuoteContent from './QuoteContent.svelte'

	let currentSlide = 0

	const quotes = [
		{
			text: 'The development of full artificial intelligence could spell the end of the human race',
			author: 'Stephen Hawking',
			title: 'Theoretical physicist and cosmologist',
			image: '/images/quotes/hawking.jpg'
		},
		{
			text: "I visualize a time when we will be to robots what dogs are to humans, and I'm rooting for the machines",
			author: 'Claude Shannon',
			title: 'Father of Information Theory',
			image: '/images/quotes/shannon.jpg'
		},
		{
			text: 'By far, the greatest danger of Artificial Intelligence is that people conclude too early that they understand it',
			author: 'Eliezer Yudkowsky',
			title: 'AI Researcher',
			image: '/images/quotes/yudkowsky.jpg'
		},
		{
			text: 'AI is likely to be either the best or worst thing to happen to humanity',
			author: 'Stuart Russell',
			title: 'Computer Scientist',
			image: '/images/quotes/russell.jpg'
		},
		{
			text: 'The real question is, when will we draft an artificial intelligence bill of rights?',
			author: 'Gray Scott',
			title: 'Futurist',
			image: '/images/quotes/scott.jpg'
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
		color: #666;
	}

	.nav-button:hover {
		color: #333;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ddd;
		transition: background-color 0.3s ease;
	}

	.dot.active {
		background: #666;
	}
</style>
