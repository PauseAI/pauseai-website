<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import Person from './person.svelte'
	export let data
	const { people } = data
	const { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<section data-pagefind-ignore>
	{#if people.length === 0}
		<p>No team members found</p>
	{/if}
	<ul class="people">
		{#each people as { name, image, bio, title }}
			<Person {name} {image} {bio} {title} />
		{/each}
	</ul>
</section>

<style>
	.people {
		display: grid;
		gap: 1rem;
	}
</style>
