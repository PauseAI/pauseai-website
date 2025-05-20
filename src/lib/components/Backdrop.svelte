<script lang="ts">
	import { fade } from 'svelte/transition'

	export let open: boolean | undefined
</script>

{#if open}
	<div transition:fade={{ duration: 100 }} class="backdrop" />
{/if}

<style>
	.backdrop {
		backdrop-filter: blur(10px) brightness(0.9) saturate(0.9);
		-webkit-backdrop-filter: blur(10px) brightness(0.9) saturate(0.9);
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}
</style>
