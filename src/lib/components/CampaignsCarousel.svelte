<script lang="ts">
	import CampaignCard from './CampaignCard.svelte'
	import { campaigns } from '$lib/data/campaigns'
</script>

<div class="campaigns-grid">
	{#each campaigns as campaign}
		<CampaignCard {campaign} />
	{/each}
</div>

<style>
	.campaigns-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}
</style>
