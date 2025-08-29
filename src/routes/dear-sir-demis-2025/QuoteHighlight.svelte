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
				{quote.quote}
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
		border-radius: 20px;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(255, 148, 22, 0.1);
		height: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
		backdrop-filter: blur(10px);
	}

	.quote-highlight::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(145deg, rgba(255, 148, 22, 0.05) 0%, transparent 60%);
		border-radius: 20px;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.quote-highlight:hover {
		transform: translateY(-5px);
		box-shadow: 0 12px 35px rgba(255, 148, 22, 0.15);
		border-color: var(--brand);
	}

	.quote-highlight:hover::before {
		opacity: 1;
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
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
		border: 3px solid var(--bg);
		transition: all 0.3s ease;
	}

	.quote-highlight:hover .portrait {
		transform: scale(1.05);
		box-shadow: 0 6px 20px rgba(255, 148, 22, 0.2);
		border-color: rgba(255, 148, 22, 0.3);
	}

	.text-container {
		flex: 1;
		min-width: 0;
	}

	.quote-text {
		font-style: italic;
		font-size: 1rem;
		line-height: 1.6;
		margin: 0 0 1.25rem 0;
		color: var(--text);
		position: relative;
		padding-left: 2rem;
		padding-top: 0.5rem;
		font-weight: 400;
	}

	.quote-text::before {
		content: '"';
		position: absolute;
		left: 0;
		top: -0.1rem;
		font-size: 3rem;
		color: var(--brand);
		opacity: 0.4;
		font-family: 'Times New Roman', serif;
		line-height: 1;
		font-weight: 700;
	}

	.quote-text::after {
		content: '"';
		position: relative;
		float: right;
		margin-top: 0.25rem;
		margin-right: -0.5rem;
		font-size: 2.5rem;
		color: var(--brand);
		opacity: 0.4;
		font-family: 'Times New Roman', serif;
		line-height: 1;
		font-weight: 700;
	}

	.quote-attribution {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding-left: 2rem;
		position: relative;
	}

	.quote-attribution::before {
		content: '—';
		position: absolute;
		left: 0.5rem;
		top: 0;
		color: var(--brand);
		opacity: 0.6;
		font-weight: 700;
	}

	.quote-attribution .name {
		font-weight: 600;
		color: var(--brand);
		font-size: 1rem;
		font-style: normal;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
			padding-left: 1.75rem;
		}

		.quote-text::before {
			font-size: 2.5rem;
		}

		.quote-attribution .name {
			font-size: 0.9rem;
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
			font-size: 2rem;
		}

		.quote-text::after {
			float: none;
			display: block;
			text-align: center;
			margin-right: 0;
			margin-top: 0.5rem;
			font-size: 2rem;
		}

		.quote-attribution {
			padding-left: 0;
			align-items: center;
		}

		.quote-attribution::before {
			left: 50%;
			transform: translateX(-50%);
		}
	}
</style>
