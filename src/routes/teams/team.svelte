<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown'
	import A from '$lib/components/custom/a.svelte'

	export let description: string | undefined
	export let name: string | undefined
	export let leadName: string | undefined
	export let leadEmail: string | undefined
</script>

<li class="team">
	<div class="name">
		{name}
	</div>
	<div class="description prose">
		<SvelteMarkdown source={description} renderers={{ link: A }} />
	</div>
	<div class="lead">Team leader: <a href={`mailto:${leadEmail}`} class="lead">{leadName}</a></div>
</li>

<style>
	.team {
		display: flex;
		flex-direction: column;
		position: relative;
		gap: 0.5rem;
	}

	.description {
		position: relative;
		/* /* show all formatting, like newlines */
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
	}
</style>
