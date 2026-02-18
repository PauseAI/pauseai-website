<script lang="ts">
	import type { NewsItem } from '$lib/types'
	import NewsCard from '$lib/components/NewsCard.svelte'
	import { onMount } from 'svelte'

	let newsItems: NewsItem[] = []
	let loading = true

	onMount(async () => {
		try {
			const response = await fetch('/api/news')
			newsItems = await response.json()
		} catch (error) {
			console.error('Failed to load news:', error)
		} finally {
			loading = false
		}
	})
</script>

<section class="latest-news" data-pagefind-ignore>
	<h2 class="section-title toc-exclude">Latest</h2>

	{#if loading}
		<div class="loading">Loading news...</div>
	{:else if newsItems.length > 0}
		<div class="news-grid">
			{#each newsItems as item}
				<NewsCard {item} />
			{/each}
		</div>
	{/if}
</section>

<style>
	.latest-news {
		width: 100%;
		margin: 0 auto;
	}

	.section-title {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 2.5rem;
		text-transform: uppercase;
		margin-bottom: 1.5rem;
	}

	.news-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
	}

	.loading {
		text-align: center;
		padding: 2rem;
		opacity: 0.6;
	}

	@media (max-width: 850px) {
		.news-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 500px) {
		.news-grid {
			grid-template-columns: 1fr;
		}

		.section-title {
			font-size: 2rem;
		}
	}
</style>
