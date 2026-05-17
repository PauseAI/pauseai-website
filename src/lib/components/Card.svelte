<script lang="ts">
	interface Props {
		className?: string
		children?: import('svelte').Snippet
	}

	let { className = '', children }: Props = $props()
</script>

<div class="card {className}">
	{@render children?.()}
</div>

<style>
	.card {
		border-radius: 5px;
		box-shadow: 0px 5px 20px 0px rgb(0, 0, 0, 0.1);
		background-color: var(--bg-secondary);
	}
</style>
