<script lang="ts">
	export let urls: string[]
</script>

<svelte:head>
	{#each urls as url}
		<link rel="preload" href={url} as="font" type="font/woff2" crossorigin="anonymous" />
	{/each}
</svelte:head>
