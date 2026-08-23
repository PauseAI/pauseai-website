<script lang="ts">
	import { onMount } from 'svelte'
	import PersonCard from './PersonCard.svelte'
	import type { AboutApiResponse } from '$api/about/+server.js'

	const groupOrder = [
		'Executive Team',
		'National Leaders',
		'National Chapter Leads',
		'Global Board'
	]

	let peopleGroups = $state<AboutApiResponse>({})
	let loading = $state(true)

	onMount(async () => {
		try {
			const response = await fetch('/api/about')
			if (!response.ok) {
				throw new Error(`Failed to load people data: ${response.status} ${response.statusText}`)
			}
			peopleGroups = (await response.json()) as AboutApiResponse
		} finally {
			loading = false
		}
	})

	// Get all group keys and sort them according to the manual order
	const allGroupKeys = $derived(Object.keys(peopleGroups))

	// Add any groups that weren't in the manual order (in case new ones appear)
	const remainingGroups = $derived(allGroupKeys.filter((group) => !groupOrder.includes(group)))
	const groupKeys = $derived(
		groupOrder.filter((group) => allGroupKeys.includes(group)).concat(remainingGroups)
	)
</script>

<section data-pagefind-ignore>
	{#if loading}
		{#each ['Executive Team', 'National Leaders'] as groupName}
			<h2 class="group-header">{groupName}</h2>
			<ul class="people">
				{#each Array(4) as _}
					<PersonCard loading image={undefined} name={undefined} title={undefined} />
				{/each}
			</ul>
			<hr class="group-divider" />
		{/each}
	{:else if groupKeys.length === 0}
		<p>No team members found</p>
	{:else}
		{#each groupKeys as groupName}
			<h2 class="group-header">{groupName}</h2>

			{#if peopleGroups[groupName].length > 0}
				<ul class="people">
					{#each peopleGroups[groupName] as { name, image, title }}
						<PersonCard {name} {image} {title} />
					{/each}
				</ul>
			{/if}

			<hr class="group-divider" />
		{/each}
	{/if}
</section>

<style>
	section {
		margin-top: 2rem;
	}

	.group-header {
		font-size: 2rem;
		margin-top: 1rem;
		margin-bottom: 0.25rem;
		border-bottom: 2px solid #ccc;
	}

	.group-divider {
		margin: 1rem 0;
		border: none;
	}

	.people {
		display: grid;
		gap: 1rem;
		list-style: none;
		padding: 0;
		grid-template-columns: 1fr;
		align-items: start;
	}

	@media (min-width: 768px) {
		.people {
			grid-template-columns: 1fr 1fr;
			gap: 2rem 1rem;
		}
	}
</style>
