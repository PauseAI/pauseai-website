<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		/** Primary for the main action, ghost for the rest. */
		variant?: 'primary' | 'ghost'
		size?: 'small' | 'large'
		disabled?: boolean
		/** Shows the action is under way, and stops it being pressed again meanwhile. */
		pending?: boolean
		onclick?: (event: MouseEvent) => void
		children: Snippet
	}

	let {
		variant = 'ghost',
		size = 'large',
		disabled = false,
		pending = false,
		onclick,
		children
	}: Props = $props()
</script>

<!-- A pending button stays focusable, so focus is not lost while a file is made. -->
<button
	type="button"
	class="{variant} {size}"
	class:pending
	disabled={disabled || undefined}
	aria-disabled={pending || undefined}
	aria-busy={pending || undefined}
	onclick={(e) => {
		if (!pending) onclick?.(e)
	}}
>
	{@render children()}
</button>

<style>
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border: 2px solid var(--brand);
		border-radius: 10px;
		font-family: var(--font-body);
		font-weight: 700;
		cursor: pointer;
	}

	.large {
		padding: 0.6rem 1.1rem;
		font-size: 1rem;
	}

	.small {
		padding: 0.35rem 0.75rem;
		font-size: 0.875rem;
	}

	.primary {
		background-color: var(--brand);
		color: var(--black);
	}

	.primary:hover:not(:disabled) {
		background-color: var(--hero-orange);
	}

	.ghost {
		background-color: transparent;
		color: var(--text);
	}

	.ghost:hover:not(:disabled) {
		background-color: var(--bg-subtle);
	}

	button:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	button:disabled {
		border-color: var(--grey-300);
		background-color: transparent;
		color: var(--grey-300);
		cursor: default;
	}

	.pending {
		cursor: progress;
		opacity: 0.7;
	}
</style>
