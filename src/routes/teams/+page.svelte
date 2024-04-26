<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import Team from './team.svelte'
	export let data
	const { props } = data
	const { title, description, date } = meta
	import SvelteMarkdown from 'svelte-markdown'
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<SvelteMarkdown
	source={`
PauseAI consists almost exclusively of [volunteers](/people) ([sign up
here](https://airtable.com/appWPTGqZmUcs3NWu/pag7ztLh27Omj5s2n/form)). We are organized in teams,
each working on a different aspect of our movement. Every team has a leader, regular meetings, and
a Role on the [discord server](https://discord.gg/2XXWXvErfA).
`}
/>

<section data-pagefind-ignore>
	{#if props.length === 0}
		<p>No team members found</p>
	{/if}
	<ul class="people">
		{#each props as { name, description, leadName, leadEmail }}
			<Team {name} {description} {leadName} {leadEmail} />
		{/each}
	</ul>
</section>

<style>
	.people {
		display: grid;
		gap: 1rem;
	}
</style>
