<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown'
	import Link from '$lib/components/Link.svelte'
	import type { Team } from '$lib/types'
	import ChevronDown from 'lucide-svelte/icons/chevron-down'
	import { slide } from 'svelte/transition'
	import Button from '$lib/components/Button.svelte'

	export let team: Team
	export let collapsed = true
</script>

<li class="team">
	<div class="name">
		{team.name}
	</div>
	<div class="description prose">
		<SvelteMarkdown source={team.description} renderers={{ link: Link }} />
	</div>

	{#if collapsed}
		<div out:slide>
			<Button
				subtle
				on:click={() => {
					collapsed = !collapsed
				}}
			>
				Show more
				<ChevronDown />
				<!-- <ChevronUp /> -->
			</Button>
		</div>
	{/if}
	{#if !collapsed}
		<div in:slide out:slide class="details">
			<h3>Team lead: <Link href={`mailto:${team.leadEmail}`}>{team.leadName}</Link></h3>
			<h3>Responsibilities</h3>
			<ul class="responsibilities">
				{#each team.responsibilities as r}
					<li>{r}</li>
				{/each}
			</ul>
		</div>
	{/if}
</li>

<style>
	.team {
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.description {
		position: relative;
		/* show all formatting, like newlines */
		white-space: pre-wrap;
		overflow-wrap: break-word;
		word-wrap: break-word;
	}

	.name {
		color: var(--text);
		font-family: var(--font-heading);
		font-weight: bold;
		text-decoration: none;
		font-size: 1.4rem;
		text-transform: capitalize;
		margin: 0;
		display: flex;
		flex-direction: row;
	}

	h3 {
		margin: 0;
		margin-bottom: 1rem;
	}

	/* Style applied to the A component inside h3 */
	h3 :global(a) {
		align-items: center;
		display: inline-flex;
	}

	.responsibilities {
		list-style-type: disc;
		margin-left: 1rem;
		padding: 0.3rem;
		margin-bottom: 1rem;
		margin-top: -1rem;
	}
</style>
