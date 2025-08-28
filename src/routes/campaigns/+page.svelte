<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import CampaignCard from '$lib/components/CampaignCard.svelte'
	import { campaigns } from '$lib/data/campaigns'

	export let data

	const { title, description, date } = meta
	let currentCampaigns = campaigns.filter((campaign) => campaign.isCurrent)
	let pastCampaigns = campaigns.filter((campaign) => !campaign.isCurrent)
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<section>
	<h2>Current Campaigns</h2>
	{#if currentCampaigns.length === 0}
		<p>No current campaigns found</p>
	{/if}
	<ul class="campaigns-grid">
		{#each currentCampaigns as campaign}
			<CampaignCard {campaign} />
		{/each}
	</ul>
</section>

<h2>Past Campaigns</h2>
{#if pastCampaigns.length === 0}
	<p>No past campaigns found</p>
{/if}
<ul class="campaigns-grid">
	{#each pastCampaigns as campaign}
		<CampaignCard {campaign} />
	{/each}
</ul>

<h2>Start a campaign?</h2>
<p>Pitch your idea on our Discord server, or <a href="mailto:info@pauseai.info">email us</a>.</p>

<style>
	.campaigns-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}
</style>
