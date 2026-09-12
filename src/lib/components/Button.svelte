<script lang="ts">
	interface Props {
		subtle?: boolean
		disabled?: boolean
		onclick?: (event: MouseEvent) => void
		children?: import('svelte').Snippet
	}

	let { subtle = false, disabled = false, onclick, children }: Props = $props()
</script>

<button {onclick} class:subtle class:disabled>
	{@render children?.()}
</button>

<style>
	button {
		background-color: var(--brand);
		border: none;
		border-radius: 10px;
		padding: 10px;
		font-family: var(--font-body);
		cursor: pointer;
		display: flex;
		font-weight: bold;
		color: var(--bg);
		position: relative;
	}
	button.subtle {
		background-color: var(--bg);
		color: var(--brand);
	}
	button.subtle:hover {
		background-color: var(--bg);
		text-decoration: underline;
	}
	button:hover {
		background-color: var(--brand-subtle);
	}
	button:active {
		background-color: var(--brand);
	}
	button.disabled {
		background-color: rgba(var(--grey-mid-rgb), 0.5);
		cursor: default;
	}
</style>
