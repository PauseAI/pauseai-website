<script>
	export let quote
</script>

<div class="quote-card">
	<div class="quote-text">
		{quote.text}
	</div>

	<div class="author-section">
		{#if quote.image !== undefined}
			<img src={quote.image} alt={quote.author} class="author-image" />
		{/if}
		<div class="author-info">
			<h2 class="author-name">{quote.author}</h2>
			<p class="author-title">{quote.title}</p>
		</div>
	</div>
</div>

<style>
	.quote-card {
		background: var(--color-background);
		min-height: 18rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.quote-text {
		font-size: clamp(1.2rem, 4vw, 1.7rem);
		margin-bottom: 1rem;
		position: relative;
	}

	.quote-text::before {
		content: open-quote;
		font-size: clamp(2rem, 4vw, 4rem);
		position: absolute;
		top: -1rem;
		font-weight: 800;
		left: -1rem;
		opacity: 0.3;
	}

	.author-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.author-image {
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
		object-fit: cover;
	}

	.author-name {
		font-size: 1.4rem;
		font-weight: 800;
		font-family: var(--font-body);
		margin: 0;
	}

	.author-title {
		margin: 0;
	}
</style>
