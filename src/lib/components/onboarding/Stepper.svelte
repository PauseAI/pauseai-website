<script lang="ts">
	let { labels, current }: { labels: string[]; current: number } = $props()
</script>

<ol class="stepper">
	{#each labels as label, i (label)}
		<li class:active={i === current} class:done={i < current}>
			<span class="dot">{i < current ? '✓' : i + 1}</span>
			<span class="step-label">{label}</span>
		</li>
	{/each}
</ol>

<style>
	.stepper {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		list-style: none;
		padding: 0;
		margin: 0 0 1.5rem 0;
		flex-wrap: wrap;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		opacity: 0.5;
	}

	li:not(:first-child)::before {
		content: '';
		display: inline-block;
		width: 1.5rem;
		height: 2px;
		background-color: var(--brand-subtle);
		margin-right: 0.5rem;
	}

	li.active,
	li.done {
		opacity: 1;
	}

	.dot {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 50%;
		background-color: var(--bg-subtle);
		border: 2px solid var(--brand-subtle);
		font-size: 0.8rem;
		font-weight: bold;
		flex-shrink: 0;
	}

	li.active .dot {
		border-color: var(--brand);
		color: var(--brand);
	}

	li.done .dot {
		background-color: var(--brand);
		border-color: var(--brand);
		color: var(--bg);
	}

	.step-label {
		font-size: 0.85rem;
	}

	@media (max-width: 600px) {
		.step-label {
			display: none;
		}

		li.active .step-label {
			display: inline;
		}
	}
</style>
