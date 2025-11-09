<script lang="ts">
	export let text: string
	export let position: 'top' | 'bottom' | 'left' | 'right' = 'top'

	let showTooltip = false
</script>

<div class="tooltip-wrapper">
	<button
		class="tooltip-trigger"
		on:mouseenter={() => (showTooltip = true)}
		on:mouseleave={() => (showTooltip = false)}
		on:focus={() => (showTooltip = true)}
		on:blur={() => (showTooltip = false)}
		aria-label={text}
		type="button"
	>
		<span class="info-icon">ℹ️</span>
	</button>

	{#if showTooltip}
		<div
			class="tooltip-content"
			class:top={position === 'top'}
			class:bottom={position === 'bottom'}
			class:left={position === 'left'}
			class:right={position === 'right'}
		>
			{text}
		</div>
	{/if}
</div>

<style>
	.tooltip-wrapper {
		position: relative;
		display: inline-block;
	}

	.tooltip-trigger {
		background: none;
		border: none;
		cursor: help;
		padding: 0;
		margin: 0 0 0 var(--spacing-xs);
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.info-icon {
		font-size: 1rem;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.tooltip-trigger:hover .info-icon,
	.tooltip-trigger:focus .info-icon {
		opacity: 1;
	}

	.tooltip-content {
		position: absolute;
		background: var(--bg-dark, #1a1a1a);
		color: var(--text-light, #ffffff);
		padding: var(--spacing-sm);
		border-radius: 6px;
		font-size: 0.875rem;
		line-height: 1.4;
		min-width: 300px;
		max-width: min(600px, calc(100vw - 2rem));
		z-index: 1000;
		white-space: normal;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		pointer-events: none;
	}

	.tooltip-content.top {
		bottom: calc(100% + 8px);
		right: 0;
	}

	.tooltip-content.bottom {
		top: calc(100% + 8px);
		right: 0;
	}

	.tooltip-content.left {
		right: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
	}

	.tooltip-content.right {
		left: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
	}

	@media (max-width: 768px) {
		.tooltip-content {
			min-width: 250px;
			font-size: 0.8125rem;
		}
	}
</style>
