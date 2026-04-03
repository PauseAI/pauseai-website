<script lang="ts">
	import type { PressCoverage } from './notion.server'
	import NewsCard from '$lib/components/NewsCard.svelte'
	import type { NewsItem } from '$lib/types'

	// Temporarily support the old 'publication' property if hot module reload hasn't caught the backend change yet
	type CoverageItem = PressCoverage & { publication?: string }
	export let coverage: CoverageItem[] = []
	export let typeOrder: string[] = []
	export let outletOrder: string[] = []

	function toNewsItem(item: CoverageItem): NewsItem {
		return {
			title: item.title,
			subtitle: item.notes?.trim() ?? '',
			date: item.date,
			image: item.image,
			href: item.url,
			source: 'press',
			outlet: item.outlet
		}
	}

	// Extract unique type names for tab labels
	$: availableTypes = Array.from(new Set(coverage.map((c) => c.type))).filter(Boolean) as string[]

	// Sort them based on the schema order fetched directly from Notion
	$: orderedTabs = typeOrder.length > 0 ? typeOrder : outletOrder
	$: tabs = [...availableTypes].sort((a, b) => {
		const indexA = orderedTabs.indexOf(a)
		const indexB = orderedTabs.indexOf(b)
		if (indexA !== -1 && indexB !== -1) return indexA - indexB
		if (indexA !== -1) return -1
		if (indexB !== -1) return 1
		return a.localeCompare(b)
	})

	let activeTab = ''
	$: {
		// Set default to International if available, or first ordered tab
		if (!tabs.includes(activeTab) && tabs.length > 0) {
			activeTab = tabs.find((t) => t.includes('International')) || tabs[0]
		}
	}

	$: filteredCoverage = coverage.filter((c) => c.type === activeTab)
</script>

<div class="coverage-layout">
	{#if coverage.length === 0}
		<p class="empty-state">No press coverage found.</p>
	{:else}
		<div class="tabs-container">
			{#each tabs as tab}
				<button
					class="tab-button"
					class:active={activeTab === tab}
					on:click={() => (activeTab = tab)}
				>
					{tab}
				</button>
			{/each}
		</div>

		<div class="coverage-cards">
			{#each filteredCoverage as item (item.id)}
				<NewsCard id={item.id} item={toNewsItem(item)} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.coverage-layout {
		margin: 1.5rem 0;
	}

	.empty-state {
		text-align: center;
		color: var(--text-subtle);
		font-style: italic;
	}

	/* TABS */
	.tabs-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-bottom: 2rem;
		background: var(--bg-card, var(--bg));
		padding: 0.5rem;
		border-radius: 12px;
		border: 1px solid var(--border);
	}

	.tab-button {
		display: inline-flex;
		align-items: center;
		background: transparent;
		border: none;
		color: var(--text);
		font-weight: 600;
		font-size: 0.95rem;
		padding: 0.6rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab-button:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
	}

	.tab-button.active {
		color: var(--brand);
		background: color-mix(in srgb, var(--brand) 10%, transparent);
	}

	/* Same grid rhythm as Latest news */
	.coverage-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
	}

	@media (max-width: 850px) {
		.coverage-cards {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 500px) {
		.coverage-cards {
			grid-template-columns: 1fr;
		}
	}

	/* Optional: Apply an explicit global margin style on the Press page for the branding section */
	:global(.logo-materials) {
		margin-top: 4rem;
	}
</style>
