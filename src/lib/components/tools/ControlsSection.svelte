<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		heading?: string
		children: Snippet
	}

	let { heading, children }: Props = $props()
</script>

<!-- One section of a tool's form, with its heading when it has one. -->
<section>
	{#if heading}
		<h2>{heading}</h2>
	{/if}
	{@render children()}
</section>

<style>
	h2 {
		margin: 0 0 0.75rem;
		font-size: 1.4rem;
	}
</style>
