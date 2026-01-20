<script lang="ts">
	import type { Community } from './communities'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import { Globe, Mail } from 'lucide-svelte'
	import Discord from '$lib/components/icons/discord.svelte'
	import Whatsapp from '$lib/components/icons/whatsapp.svelte'
	import Facebook from '$lib/components/icons/facebook.svelte'
	import Instagram from '$lib/components/icons/instagram.svelte'
	import X from '$lib/components/icons/x.svelte'
	import Linkedin from '$lib/components/icons/linkedin.svelte'
	import Youtube from '$lib/components/icons/youtube.svelte'
	import TikTok from '$lib/components/icons/tiktok.svelte'
	import Substack from '$lib/components/icons/substack.svelte'
	import { onMount } from 'svelte'
	import { loadNationalGroups } from '$lib/stores/nationalGroups'
	import type { NationalGroup } from '$lib/types'

	export let communities: Community[] = []

	let nationalGroups: NationalGroup[] = []

	onMount(async () => {
		nationalGroups = await loadNationalGroups()
	})

	// Group communities by their country/national community
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
			{@const group = nationalGroups.find(
				(g) => g.name.toLowerCase() === nationality.toLowerCase()
			)}
			{@const imageUrl = group?.image || '/images/default.png'}
			{@const nationalChapter = nationalChapters.find((c) => c.name === nationality)}
			<div class="country-card">
				<button
					class="country-header"
					class:expanded={expandedCountries.has(nationality)}
					class:has-communities={localCommunities.length > 0}
					disabled={localCommunities.length === 0}
					on:click={() => toggleCountry(nationality)}
				>
					<div class="icon" class:is-open={expandedCountries.has(nationality)}>
						{#if localCommunities.length > 0}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="6 9 12 15 18 9"></polyline>
							</svg>
						{:else}
							<!-- Placeholder for alignment if no communities/arrow -->
							<div style="width: 24px;"></div>
						{/if}
					</div>

					<div class="image-name-wrapper">
						<img src={imageUrl} alt={nationality} class="country-image" />
						<span class="country-name">
							{nationalChapter?.country_local || nationality}
						</span>
						{#if nationalLinks[nationality]}
							{@const link = nationalLinks[nationality]}
							<LinkWithoutIcon
								href={link}
								class="social-link"
								target="_blank"
								rel="noopener noreferrer"
								on:click={(e) => e.stopPropagation()}
							>
								{#if link.includes('discord')}
									<Discord />
								{:else if link.includes('whatsapp')}
									<Whatsapp />
								{:else if link.includes('facebook')}
									<Facebook />
								{:else if link.includes('instagram')}
									<Instagram />
								{:else if link.includes('twitter') || link.includes('x.com')}
									<X />
								{:else if link.includes('linkedin')}
									<Linkedin />
								{:else if link.includes('youtube')}
									<Youtube />
								{:else if link.includes('tiktok')}
									<TikTok />
								{:else if link.includes('substack')}
									<Substack />
								{:else if link.includes('mailto:')}
									<Mail size={18} />
								{:else}
									<Globe size={18} />
								{/if}
							</LinkWithoutIcon>
						{/if}
					</div>
				</button>
				{#if expandedCountries.has(nationality) && localCommunities.length > 0}
					<div class="local-communities">
						{#each localCommunities.sort((a, b) => a.name.localeCompare(b.name)) as localCommunity}
							<LinkWithoutIcon
								href={localCommunity.link}
								class="local-link"
								target="_blank"
								rel="noopener noreferrer"
							>
								{localCommunity.name}
							</LinkWithoutIcon>
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
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.country-card {
		/* Removed border and background for "No boxes" look */
		overflow: hidden;
		transition: transform 0.2s;
	}

	.country-header {
		width: 100%;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		font-size: 0.95rem;
		color: var(--text);
		border-radius: 8px;
		transition: background-color 0.2s;
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

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-1);
		transition: transform 0.2s ease;
		flex-shrink: 0;
		opacity: 0.7;
		width: 24px;
	}

	.icon.is-open {
		transform: rotate(180deg);
		opacity: 1;
	}

	.image-name-wrapper {
		display: flex;
		align-items: center;
		flex-grow: 1;
		gap: 0.5rem;
	}

	.country-image {
		width: 32px;
		height: 32px;
		object-fit: cover;
		border-radius: 50%;
	}

	.country-name {
		font-weight: 600;
		font-size: 1.1rem;
		min-width: 0;
	}

	.country-name :global(a) {
		text-decoration: none;
		color: inherit;
	}

	.country-name :global(a:hover) {
		text-decoration: underline;
	}

	.local-communities {
		padding: 0 0.5rem 0.5rem 3rem; /* Indent to align with text */
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	:global(.local-link) {
		padding: 0.2rem 0;
		text-decoration: none;
		color: var(--primary); /* Use primary color for links */
		font-size: 0.9rem;
		display: block;
	}

	:global(.local-link:hover) {
		text-decoration: underline;
	}

	:global(.social-link) {
		display: flex;
		align-items: center;
		color: var(--text-2);
		margin-left: auto;
		padding: 0.25rem;
		border-radius: 4px;
		transition:
			color 0.2s,
			background-color 0.2s;
	}

	:global(.social-link:hover) {
		color: var(--brand);
		background-color: var(--bg-3);
	}

	:global(.social-link svg) {
		width: 18px;
		height: 18px;
	}

	/* Custom icons use fill */
	:global(.social-link svg:not([class*='lucide'])) {
		fill: currentColor;
	}

	/* Lucide icons use stroke */
	:global(.social-link svg[class*='lucide']) {
		stroke: currentColor;
	}

	@media (max-width: 768px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
