<!-- @visualDiffEnabled: false — ~22,000px tall, exceeds Chromatic's 25M-pixel snapshot cap -->
<script lang="ts">
	import { title } from '$lib/config'
	import Quote from './Quote.svelte'
	import { meta } from './meta'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import GithubSlugger from 'github-slugger'
	import type { PageData } from './$types'

	export let data: PageData

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

{#if quotes.some((quote) => quote.notice)}
	<h2>Background credits</h2>
	{#each quotes as quote}
		{#if quote.notice}
			<h3 id={'credits-' + new GithubSlugger().slug(quote.author)}>{quote.author}</h3>
			{quote.notice}
		{/if}
	{/each}
{/if}
