<script lang="ts">
	import PostMeta from '$components/PostMeta.svelte'
	import { meta } from './meta'
	import Person from './person.svelte'
	export let data
	const { props } = data
	const { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<section data-pagefind-ignore>
	{#if props.length === 0}
		<p>No team members found</p>
	{/if}
	<ul class="people">
		{#each props as { name, image, bio, title }}
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
