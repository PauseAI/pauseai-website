<script lang="ts">
	import CampaignCard from './CampaignCard.svelte'
	import { campaigns } from '$lib/data/campaigns'
	let filteredCampaigns = campaigns.filter((campaign) => campaign.isCurrent)
</script>

<h2>Our current campaigns</h2>
<div class="campaigns-grid">
	{#each filteredCampaigns as campaign}
		<CampaignCard {campaign} />
	{/each}
</div>

<style>
	h2 {
		text-transform: uppercase;
	}
	.campaigns-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}
</style>
