<script lang="ts">
	import { title } from '$lib/config'
	import Quote from './Quote.svelte'

	export let data

	const { quotes } = data
	// console.log(data)
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

{#each quotes as quote}
	<Quote {...quote} />
{/each}
