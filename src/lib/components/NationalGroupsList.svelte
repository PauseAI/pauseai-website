<script lang="ts">
	import { onMount } from 'svelte'
	import type { NationalGroup } from '$lib/types'
	import NationalGroupItem from '$lib/components/NationalGroupItem.svelte'
	import { loadNationalGroups } from '$lib/stores/nationalGroups'

	export let nationalGroups: NationalGroup[] = []

	onMount(async () => {
		if (nationalGroups.length === 0) {
			nationalGroups = await loadNationalGroups()
		}
	})
</script>

<section data-pagefind-ignore>
	{#if nationalGroups.length === 0}
		<p>Loading national groups...</p>
	{:else}
		<ul class="national-groups">
			{#each nationalGroups as nationalGroup}
				<NationalGroupItem {nationalGroup} />
			{/each}
		</ul>
	{/if}
</section>

<style>
	.national-groups {
		display: grid;
		gap: 1rem;
		list-style-type: none;
		padding: 0;
		margin: 1.5rem 0;
	}
</style>
