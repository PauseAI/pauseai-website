<script lang="ts">
	/** Emoji or short text to display as the icon */
	export let icon: string = ''
	/** Card title */
	export let title: string
	/** URL for the call-to-action link (optional) */
	export let href: string = ''
	/** Label for the call-to-action link */
	export let linkText: string = ''
</script>

<div class="action-card">
	{#if icon}
		<div class="icon-wrapper">
			<span class="icon">{icon}</span>
		</div>
	{/if}
	<h3 class="card-title toc-exclude">{title}</h3>
	<p class="card-body">
		<slot />
	</p>
	{#if href && linkText}
		<a class="card-cta" {href}>{linkText} →</a>
	{/if}
</div>

<style>
	.action-card {
		background: var(--bg-subtle);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.action-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
	}

	.icon-wrapper {
		width: 2.5rem;
		height: 2.5rem;
		background: var(--brand);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	.card-title {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.1rem;
		margin: 0;
		text-transform: none;
		line-height: 1.2;
	}

	.card-body {
		font-size: 0.95rem;
		line-height: 1.6;
		margin: 0;
		color: var(--text);
		opacity: 0.85;
		flex: 1;
	}

	/* Allow rich HTML (links) inside slot */
	.card-body :global(a) {
		color: var(--brand);
		text-decoration: underline;
	}

	.card-cta {
		color: var(--brand);
		font-weight: 600;
		font-size: 0.9rem;
		text-decoration: none;
		margin-top: auto;
	}

	.card-cta:hover {
		text-decoration: underline;
	}
</style>
