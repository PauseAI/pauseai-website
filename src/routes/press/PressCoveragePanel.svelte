<script lang="ts">
	import type { PressCoverage } from './notion.server'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'

	// Temporarily support the old 'publication' property if hot module reload hasn't caught the backend change yet
	type CoverageItem = PressCoverage & { publication?: string }
	export let coverage: CoverageItem[] = []
	export let outletOrder: string[] = []

	const formatDate = (dateString: string) => {
		if (!dateString) return ''
		try {
			const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
			return new Date(dateString).toLocaleDateString('en-US', options)
		} catch {
			return dateString
		}
	}

	// Extract unique outlet names
	$: availableOutlets = Array.from(new Set(coverage.map((c) => c.outlet || c.publication))).filter(
		Boolean
	) as string[]

	// Sort them based on the schema order fetched directly from Notion
	$: tabs = [...availableOutlets].sort((a, b) => {
		const indexA = outletOrder.indexOf(a)
		const indexB = outletOrder.indexOf(b)
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

	$: filteredCoverage = coverage.filter((c) => (c.outlet || c.publication) === activeTab)
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
				<LinkWithoutIcon
					class="coverage-card"
					id={item.id}
					href={item.url}
					target="_blank"
					rel="noopener noreferrer"
					style="text-decoration: none;"
				>
					<h3 class="card-title">{item.title}</h3>
					{#if item.notes && item.notes.trim()}
						<p class="card-notes">{item.notes}</p>
					{/if}
					<div class="card-footer">
						<span class="card-date">{formatDate(item.date)}</span>
						<span class="read-more">Read the article &rarr;</span>
					</div>
				</LinkWithoutIcon>
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
		gap: 0.5rem;
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

	/* COVERAGE CARDS */
	.coverage-cards {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Make the LinkWithoutIcon display as a flexible block card */
	:global(.coverage-card) {
		background: color-mix(in srgb, var(--text) 3%, var(--bg));
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1.5rem;
		display: flex !important;
		flex-direction: column;
		gap: 1rem;
		transition:
			border-color 0.2s,
			background-color 0.2s,
			transform 0.2s;
		scroll-margin-top: 5rem;
		cursor: pointer;
		text-decoration: none !important;
	}

	:global(.coverage-card:hover) {
		border-color: var(--brand);
		background-color: color-mix(in srgb, var(--brand) 2%, transparent);
		transform: translateY(-2px);
	}

	.card-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text);
		line-height: 1.3;
	}

	.card-notes {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--text);
		opacity: 0.75;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid var(--border);
		padding-top: 1rem;
		margin-top: 0.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.card-date {
		font-size: 0.9rem;
		color: var(--text);
		opacity: 0.8;
	}

	.read-more {
		color: var(--brand);
		font-weight: 600;
		font-size: 0.95rem;
		display: inline-flex;
		align-items: center;
	}

	:global(.coverage-card:hover) .read-more {
		text-decoration: underline;
	}

	/* Optional: Apply an explicit global margin style on the Press page for the branding section */
	:global(.logo-materials) {
		margin-top: 4rem;
	}
</style>
