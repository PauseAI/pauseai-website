---
title: Quotes
description: Quotes about risks from artificial intelligence
date: 2024-01-26
---

<script lang="ts">
	import escape from 'escape-html'
	import GithubSlugger from 'github-slugger'
	import Quote from '$lib/components/Quote.svelte'
	import type QuoteType from '$lib/quote'
	import data from '$lib/quotes-data.json'

	const quotes: QuoteType[] = data.quotes.map(({ text, ...quote }) => ({
		text: escape(text).replaceAll(/\*\*(.+?)\*\*/g, '<span style="font-weight: bold">$1</span>'),
		...quote
	}))

	const hasNotices = quotes.some((q) => q.notice)
</script>

{#each quotes as quote}
<Quote {...quote} />
{/each}

{#if hasNotices}

<h2>Background credits</h2>
{#each quotes as quote}
{#if quote.notice}
<h3 id={'credits-' + new GithubSlugger().slug(quote.author)}>{quote.author}</h3>
<p>{quote.notice}</p>
{/if}
{/each}
{/if}
