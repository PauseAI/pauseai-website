<script>
	export let quote
</script>

<div class="quote-card">
	<div class="quote-text">
		"{quote.text}"
	</div>

	<div class="author-section">
		<img src={quote.image} alt={quote.author} class="author-image" />
		<div class="author-info">
			<h2 class="author-name">{quote.author}</h2>
			<p class="author-title">{quote.title}</p>
		</div>
	</div>
</div>

<style>
	.quote-card {
		background: var(--color-background);
	}

	.quote-text {
		font-size: 1.7rem;
		margin-bottom: var(--spacing-lg);
	}

	.author-section {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.author-image {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		object-fit: cover;
	}

	.author-name {
		font-size: 1.4rem;
		font-weight: 600;
		margin: 0;
	}

	.author-title {
		margin: 0;
	}
</style>
