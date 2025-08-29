<script lang="ts">
	export let quote: {
		name: string
		displayName?: string
		quote: string
		portrait?: string
		title?: string
	}

	const displayName = quote.displayName || quote.name
</script>

<div class="quote-highlight">
	<div class="quote-content">
		{#if quote.portrait}
			<div class="portrait-container">
				<img src={quote.portrait} alt="Portrait of {displayName}" class="portrait" loading="lazy" />
			</div>
		{/if}
		<div class="text-container">
			<blockquote class="quote-text">
				"{quote.quote}"
			</blockquote>
			<cite class="quote-attribution">
				<span class="name">{quote.name}</span>
			</cite>
		</div>
	</div>
</div>

<style>
	.quote-highlight {
		background: var(--bg);
		border-radius: 12px;
		overflow: hidden;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		border: 1px solid var(--border-color);
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.quote-highlight:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		border-color: var(--brand);
	}

	.quote-content {
		display: flex;
		align-items: flex-start;
		gap: 1.25rem;
		padding: 1.5rem;
		flex: 1;
	}

	.portrait-container {
		flex-shrink: 0;
		position: relative;
	}

	.portrait {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		object-fit: cover;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.text-container {
		flex: 1;
		min-width: 0;
	}

	.quote-text {
		font-style: italic;
		font-size: 0.95rem;
		line-height: 1.5;
		margin: 0 0 1rem 0;
		color: var(--text);
		position: relative;
		padding-left: 1.5rem;
	}

	.quote-text::before {
		content: '"';
		position: absolute;
		left: 0;
		top: -0.25rem;
		font-size: 2rem;
		color: var(--brand);
		opacity: 0.3;
		font-family: Georgia, serif;
		line-height: 1;
	}

	.quote-attribution {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding-left: 1.5rem;
	}

	.quote-attribution .name {
		font-weight: 600;
		color: var(--brand);
		font-size: 0.95rem;
		font-style: normal;
	}

	.quote-attribution .title {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-style: normal;
	}

	@media (max-width: 768px) {
		.quote-content {
			padding: 1.25rem;
			gap: 1rem;
		}

		.portrait {
			width: 80px;
			height: 80px;
		}

		.quote-text {
			font-size: 0.9rem;
			padding-left: 1.25rem;
		}

		.quote-text::before {
			font-size: 1.5rem;
		}

		.quote-attribution .name {
			font-size: 0.9rem;
		}

		.quote-attribution .title {
			font-size: 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.quote-content {
			flex-direction: column;
			align-items: center;
			text-align: center;
			padding: 1.5rem 1rem;
		}

		.portrait {
			width: 70px;
			height: 70px;
		}

		.quote-text {
			padding-left: 0;
			padding-top: 1.5rem;
		}

		.quote-text::before {
			left: 50%;
			transform: translateX(-50%);
			top: 0;
		}

		.quote-attribution {
			padding-left: 0;
			align-items: center;
		}
	}
</style>
