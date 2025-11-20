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

	// Sort nationalities alphabetically, with "Other" at the end
	const sortedNationalities = Object.keys(groupedCommunities).sort((a, b) => {
		if (a === 'Other') return 1
		if (b === 'Other') return -1
		return a.localeCompare(b)
	})

	// Find the link for each nationality
	const nationalLinks = communities
		.filter((community) => community.type === 'national')
		.reduce(
			(acc, community) => {
				acc[community.name] = community.link
				return acc
			},
			{} as Record<string, string>
		)
</script>

<div class="prose">
	<ul>
		{#each sortedNationalities as nationality}
			<li>
				<strong>
					{#if nationalLinks[nationality]}
						<Link href={nationalLinks[nationality]}>{nationality}</Link>
					{:else}
						{nationality}
					{/if}
				</strong>
				<ul>
					{#each groupedCommunities[nationality].sort( (a, b) => a.name.localeCompare(b.name) ) as localCommunity}
						<li>
							<Link href={localCommunity.link}>{localCommunity.name}</Link>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ul>
</div>
