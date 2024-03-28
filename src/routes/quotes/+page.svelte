<script lang="ts">
	import { title } from '$lib/config'
	import Quote from './Quote.svelte'
	import { meta } from './meta'
	import PostMeta from '$lib/components/PostMeta.svelte'

	export let data

	const { quotes } = data
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<h1>{meta.title}</h1>
<PostMeta {...meta} />

{#each quotes as quote}
	<Quote {...quote} />
{/each}
