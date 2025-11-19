<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import Person from './person.svelte'
	// Ensure you update the type definition for 'people' in the data file
	// or use a helper type if needed, as it is now Record<string, Person[]>.
	export let data

	// The 'people' variable now holds the grouped object: { [GroupName: string]: Person[] }
	const peopleGroups = data.people as Record<string, Person[]>

	// Convert the object keys into an array to ensure the order is respected
	// when iterating. This is critical because the backend sorting placed
	// the keys into the object in the correct order (e.g., Global Board first).
	const groupKeys = Object.keys(peopleGroups)

	const { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<section data-pagefind-ignore>
	{#if groupKeys.length === 0}
		<p>No team members found</p>
	{/if}

	{#each groupKeys as groupName}
		<h2 class="group-header">{groupName}</h2>

		{#if peopleGroups[groupName].length > 0}
			<ul class="people">
				{#each peopleGroups[groupName] as { name, image, bio, title }}
					<Person {name} {image} {bio} {title} />
				{/each}
			</ul>
		{/if}

		<hr class="group-divider" />
	{/each}
</section>

<style>
	.group-header {
		margin-top: 2rem;
		margin-bottom: 0.5rem;
		border-bottom: 2px solid #ccc; /* Optional styling */
	}
	.group-divider {
		margin: 2rem 0;
		border: none;
		/* Hides the divider if not needed, or use margin for spacing */
	}
	.people {
		display: grid;
		/* Adjust column setup as needed, e.g., repeat(auto-fill, minmax(250px, 1fr)) */
		gap: 1rem;
		list-style: none; /* Remove default list bullets */
		padding: 0;
	}
</style>
