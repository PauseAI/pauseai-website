<script lang="ts">
	import { title } from '$lib/config'
	import Quote from './Quote.svelte'
	import { meta-expectation } from './meta-expectation'
	import { meta-inspiration } from './meta-inspiration'
	import PostMeta from '$lib/components/PostMeta.svelte';

	export let data

	const { quotes } = data
	// console.log(data)
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<h1>{meta-expectation.title}</h1>
<PostMeta {...meta-expectation} />

{#each quotes-expectation as quote}
	<Quote {...quote} />
{/each}

<h1>{meta-inspiration.title}</h1>
<PostMeta {...meta-inspiration} />

{#each quotes-inspiration as quote}
	<Quote {...quote} />
{/each}
