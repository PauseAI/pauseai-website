<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import A from '$lib/components/custom/a.svelte'
	import { meta } from './meta'
	import Team from './team.svelte'
	import SvelteMarkdown from 'svelte-markdown'

	export let data
	const { props } = data
	const { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<SvelteMarkdown
	source={`
PauseAI consists almost exclusively of [volunteers](/people) ([sign up here](https://airtable.com/appWPTGqZmUcs3NWu/pag7ztLh27Omj5s2n/form)).
We are organized in teams,
each working on a different aspect of our movement.
Every team has a leader, members, a Google Drive folder and a Role + private channel on the [discord server](https://discord.gg/asphJbnQb8).
Other than that, Teams are free to choose how they want to work.
Check out the [vacancies](/vacancies) to see some specific roles that you could take.
If you want to create a new team, reach out to the Oversight team leader (see below).
`}
	renderers={{ link: A }}
/>

<section data-pagefind-ignore>
	{#if props.length === 0}
		<p>No team members found</p>
	{/if}
	<ul class="people">
		{#each props as team}
			<Team {team} />
		{/each}
	</ul>
</section>
<h2>Become a volunteer</h2>

<p>
	If you want to join one of the teams, reach out to the team leader and <A
		href="https://airtable.com/appWPTGqZmUcs3NWu/pag7ztLh27Omj5s2n/form">sign up as a volunteer!</A
	>
</p>

<style>
	.people {
		display: grid;
		gap: 1rem;
	}
</style>
