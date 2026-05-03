<script lang="ts">
	interface Props {
		urls: string[]
	}

	let { urls }: Props = $props()
</script>

<svelte:head>
	{#each urls as url}
		<link rel="preload" href={url} as="font" type="font/woff2" crossorigin="anonymous" />
	{/each}
</svelte:head>
