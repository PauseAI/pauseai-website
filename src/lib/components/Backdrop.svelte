<script lang="ts">
	import { fade } from 'svelte/transition'

	interface Props {
		open: boolean | undefined
	}

	let { open }: Props = $props()
</script>

{#if open}
	<div transition:fade={{ duration: 100 }} class="backdrop"></div>
{/if}

<style>
	.backdrop {
		-webkit-backdrop-filter: blur(10px) brightness(0.9) saturate(0.9);
		backdrop-filter: blur(10px) brightness(0.9) saturate(0.9);
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 9;
	}
</style>
