<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import Team from './team.svelte'
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
		{#each props as { name, description, lead }}
			<Team {name} {description} {lead} />
		{/each}
	</ul>
</section>

<style>
	.people {
		display: grid;
		gap: 1rem;
	}
</style>
