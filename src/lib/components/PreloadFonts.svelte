<script lang="ts">
	import { browser } from '$app/environment'

	interface Props {
		urls: string[]
	}

	let { urls }: Props = $props()
</script>

<svelte:head>
	{#if !browser}
		{#each urls as url}
			<link rel="preload" href={url} as="font" type="font/woff2" crossorigin="anonymous" />
		{/each}
	{/if}
</svelte:head>
