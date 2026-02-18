<script lang="ts">
	import type { NewsItem } from '$lib/types'
	import NewsCard from '$lib/components/NewsCard.svelte'
	import { onMount } from 'svelte'

	let newsItems: NewsItem[] = []
	let loading = true
	let currentPage = 1
	let totalPages = 1
	const pageSize = 6

	async function loadPage(page: number) {
		loading = true
		try {
			const response = await fetch(`/api/news?page=${page}&pageSize=${pageSize}`)
			const data = await response.json()
			newsItems = data.items
			currentPage = data.page
			totalPages = data.totalPages
		} catch (error) {
			console.error('Failed to load news:', error)
		} finally {
			loading = false
		}
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			loadPage(page)
		}
	}

	onMount(() => loadPage(1))
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

		{#if totalPages > 1}
			<nav class="pagination" aria-label="News pagination">
				<button
					class="page-btn"
					disabled={currentPage <= 1}
					on:click={() => goToPage(currentPage - 1)}
					aria-label="Previous page"
				>
					‹
				</button>

				{#each Array(totalPages) as _, i}
					<button
						class="page-btn"
						class:active={currentPage === i + 1}
						on:click={() => goToPage(i + 1)}
					>
						{i + 1}
					</button>
				{/each}

				<button
					class="page-btn"
					disabled={currentPage >= totalPages}
					on:click={() => goToPage(currentPage + 1)}
					aria-label="Next page"
				>
					›
				</button>
			</nav>
		{/if}
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

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2rem;
	}

	.page-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
		border: 1px solid var(--text);
		border-radius: 6px;
		background: transparent;
		color: var(--text);
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background 0.15s ease,
			color 0.15s ease,
			opacity 0.15s ease;
	}

	.page-btn:hover:not(:disabled):not(.active) {
		background: var(--text);
		color: var(--bg);
	}

	.page-btn.active {
		background: var(--brand);
		border-color: var(--brand);
		color: white;
		font-weight: 700;
	}

	.page-btn:disabled {
		opacity: 0.3;
		cursor: default;
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
