<script lang="ts">
	import type { Community } from './communities'
	import Link from '$lib/components/Link.svelte'

	export let communities: Community[] = []

	// Group local communities by their country/national community
	const groupedCommunities = communities
		.filter((community) => community.type === 'local')
		.reduce(
			(acc, community) => {
				const nationalName = community.country || 'Other'
				if (!acc[nationalName]) {
					acc[nationalName] = []
				}
				acc[nationalName].push(community)
				return acc
			},
			{} as Record<string, Community[]>
		)

	const nationalChapters = communities.filter((community) => community.type === 'national')

	const allNationalities = [
		...new Set([...Object.keys(groupedCommunities), ...nationalChapters.map((c) => c.name)])
	]

	// Sort nationalities alphabetically, with "Other" at the end
	const sortedNationalities = allNationalities.sort((a, b) => {
		if (a === 'Other') return 1
		if (b === 'Other') return -1
		return a.localeCompare(b)
	})

	// Find the link for each nationality
	const nationalLinks = nationalChapters.reduce(
		(acc, community) => {
			acc[community.name] = community.link
			return acc
		},
		{} as Record<string, string>
	)

	// Start with all countries collapsed by default
	let expandedCountries: Set<string> = new Set()

	function toggleCountry(country: string) {
		const newSet = new Set(expandedCountries)
		if (newSet.has(country)) {
			newSet.delete(country)
		} else {
			newSet.add(country)
		}
		expandedCountries = newSet
	}
</script>

<div class="communities-container">
	<div class="grid">
		{#each sortedNationalities as nationality}
			{@const localCommunities = groupedCommunities[nationality] || []}
			<div class="country-card">
				<button
					class="country-header"
					class:expanded={expandedCountries.has(nationality)}
					class:has-communities={localCommunities.length > 0}
					on:click={() => toggleCountry(nationality)}
				>
					<span class="country-name">
						{#if nationalLinks[nationality]}
							<Link href={nationalLinks[nationality]}>{nationality}</Link>
						{:else}
							{nationality}
						{/if}
					</span>
					{#if localCommunities.length > 0}
						<span class="count-badge">{localCommunities.length}</span>
						<span class="expand-icon">{expandedCountries.has(nationality) ? '−' : '+'}</span>
					{/if}
				</button>
				{#if expandedCountries.has(nationality) && localCommunities.length > 0}
					<div class="local-communities">
						{#each localCommunities.sort((a, b) => a.name.localeCompare(b.name)) as localCommunity}
							<a
								href={localCommunity.link}
								class="local-link"
								target="_blank"
								rel="noopener noreferrer"
							>
								{localCommunity.name}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.communities-container {
		margin-top: 2rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.75rem;
	}

	.country-card {
		border: 1px solid var(--text-subtle);
		border-radius: 24px;
		background: var(--bg);
		overflow: hidden;
		transition:
			box-shadow 0.2s,
			transform 0.2s;
	}

	.country-card:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transform: translateY(-1px);
	}

	.country-header {
		width: 100%;
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		font-size: 0.95rem;
		transition: background-color 0.2s;
		color: var(--text);
	}

	.country-header:hover {
		background-color: var(--bg-subtle);
	}

	.country-header.has-communities:hover {
		background-color: var(--bg-subtle);
	}

	.country-header.expanded {
		background-color: var(--bg-subtle);
	}

	.country-name {
		flex: 1;
		font-weight: 600;
		min-width: 0;
	}

	.country-name :global(a) {
		text-decoration: none;
		color: inherit;
	}

	.country-name :global(a:hover) {
		text-decoration: underline;
	}

	.count-badge {
		background-color: var(--bg-subtle);
		color: var(--brand);
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.expand-icon {
		font-size: 1.2rem;
		font-weight: bold;
		color: var(--text);
		line-height: 1;
		width: 1.2rem;
		text-align: center;
		opacity: 0.7;
	}

	.local-communities {
		padding: 0.5rem 1rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border-top: 1px solid var(--text-subtle);
		background-color: var(--bg-subtle);
	}

	.local-link {
		padding: 0.4rem 0.6rem;
		text-decoration: none;
		color: var(--text);
		font-size: 0.875rem;
		border-radius: 8px;
		transition:
			background-color 0.2s,
			color 0.2s;
		display: block;
	}

	.local-link:hover {
		background-color: var(--bg-secondary);
		color: var(--brand);
	}

	@media (max-width: 768px) {
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 0.5rem;
		}

		.country-header {
			padding: 0.6rem 0.75rem;
			font-size: 0.9rem;
		}

		.local-communities {
			padding: 0.4rem 0.75rem 0.6rem;
		}
	}
</style>
