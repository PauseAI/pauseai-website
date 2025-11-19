<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import Person from './person.svelte'

	export let data

	const peopleGroups = data.people as Record<string, Person[]>

	const groupKeys = Object.keys(peopleGroups)

	const { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<div class="introduction">
	<h2>How We Began</h2>
	<p>
		We were founded in Utrecht, Netherlands in May 2023 by Joep Meindertsma, who put his job on hold
		because he couldn't ignore the existential risks from artificial intelligence any longer. We
		began with our first public action, which was a protest outside Microsoft's Brussels lobbying
		office in May 2023. What started as one person's call to action has grown into a global
		grassroots movement with volunteers, national chapters, and local communities across the world,
		all working toward the same goal: pausing frontier AI development until we can prove it's safe
		and keep it under democratic control.
	</p>

	<h2 class="milestones-header">Key Milestones</h2>
	<ul class="milestones-list">
		<li>
			November 2023: Protested outside the inaugural <a
				href="https://en.wikipedia.org/wiki/AI_Safety_Summit">AI Safety Summit at Bletchley Park</a
			>.
		</li>
		<li>February 2024: Gathered outside OpenAI's headquarters in San Francisco</li>
		<li>
			May 2024: Organized coordinated protests across thirteen countries—including the US, UK,
			Brazil, Germany, Australia, and Norway ahead of the AI Seoul Summit
		</li>
		<li>
			February 2025: Coordinated an event larger global protest for the French AI Summit, adding
			Kenya and DRC to the mix.
		</li>
		<li>
			June 2025: Led our biggest protest yet outside Google DeepMind's London office, holding them
			accountable for breaking their safety commitments and hosted the first ever PauseCon training
			event
		</li>
		<li>
			Ongoing: Grew from a single-country initiative into a network with national organizations like
			PauseAI US, each running their own campaigns while we coordinate globally.
		</li>
	</ul>
</div>

<section data-pagefind-ignore>
	{#if groupKeys.length === 0}
		<p>No team members found</p>
	{/if}

	{#each groupKeys as groupName}
		<h2 class="group-header">{groupName}</h2>

		{#if peopleGroups[groupName].length > 0}
			<ul class="people">
				{#each peopleGroups[groupName] as { name, image, title }}
					<Person {name} {image} {title} />
				{/each}
			</ul>
		{/if}

		<hr class="group-divider" />
	{/each}
</section>

<style>
	.introduction p,
	.milestones-list {
		line-height: 1.65;
		margin-bottom: 1.5rem;
	}

	.milestones-list {
		padding-left: 20px;
		margin-top: 0;
		list-style-type: disc;
	}

	.introduction h2 {
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
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
	}
</style>
