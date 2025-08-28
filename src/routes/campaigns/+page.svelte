<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import CampaignCard from '$lib/components/CampaignCard.svelte'
	import { campaigns } from '$lib/data/campaigns'

	export let data

	const { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<section>
	{#if campaigns.length === 0}
		<p>No campaigns found</p>
	{/if}
	<ul>
		{#each campaigns as campaign}
			<CampaignCard {campaign} />
		{/each}
	</ul>
</section>

<h2>Start a campaign?</h2>
<p></p>

<style>
</style>
