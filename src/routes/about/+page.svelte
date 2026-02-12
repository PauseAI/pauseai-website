<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import PersonCard from './person.svelte'
	import type { Person } from '$lib/types'
	import Link from '$lib/components/Link.svelte'

	export let data

	const peopleGroups = data.people as Record<string, Person[]>

	// Define the manual order for the groups
	const groupOrder = [
		'Leadership Team',
		'National Chapters',
		'National Chapter Leads',
		'Global Board'
	]

	// Get all group keys and sort them according to the manual order
	const allGroupKeys = Object.keys(peopleGroups)
	const groupKeys = groupOrder.filter((group) => allGroupKeys.includes(group))

	// Add any groups that weren't in the manual order (in case new ones appear)
	const remainingGroups = allGroupKeys.filter((group) => !groupOrder.includes(group))
	groupKeys.push(...remainingGroups)

	const { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<div class="introduction">
	<h2>How We Began</h2>
	<p>
		We were founded in Utrecht, Netherlands in May 2023 by Joep Meindertsma, who put his job on hold
		because he couldn't ignore the existential risks from artificial intelligence any longer. We
		began with our first public action, which was a protest outside <Link
			href="/brussels-microsoft-protest">Microsoft's Brussels lobbying office</Link
		>.
	</p>

	<p>
		What started as one person's call to action has grown into a global grassroots movement with
		volunteers, <Link href="/national-groups">national chapters</Link>, and
		<Link href="/local-communities">local communities</Link> across the world, all working toward the
		same goal: pausing frontier AI development until we can prove it's safe and keep it under democratic
		control.
	</p>

	<h2 class="milestones-header">Key Milestones</h2>
	<ul class="milestones-list">
		<li>
			November 2023: Protested outside the inaugural <Link href="/2023-november-uk"
				>AI Safety Summit at Bletchley Park</Link
			>.
		</li>
		<li>
			February 2024: <Link href="/2024-february"
				>Gathered outside OpenAI's headquarters in San Francisco</Link
			>
		</li>
		<li>
			May 2024: Organized coordinated protests across thirteen countries—including the US, UK,
			Brazil, Germany, Australia, and Norway ahead of the <Link href="/2024-may"
				>AI Seoul Summit</Link
			>.
		</li>
		<li>
			February 2025: Coordinated an event larger global protest for the <Link href="/2025-february"
				>French AI Summit</Link
			>, adding Kenya and DRC to the mix.
		</li>
		<li>
			June 2025: Led our <Link href="/deepmind-protest-2025"
				>biggest protest yet outside Google DeepMind's London office</Link
			>, holding them accountable for breaking their safety commitments and hosted the first ever
			PauseCon training event.
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
					<PersonCard {name} {image} {title} />
				{/each}
			</ul>
		{/if}

		<hr class="group-divider" />
	{/each}
</section>

<section class="essential-info">
	<h2>Essential Information</h2>
	<ul class="essential-info-list">
		<li><Link href="/privacy">Privacy Policy</Link></li>
		<li><Link href="/legal">Legal Info</Link></li>
		<li><Link href="/funding">Global Funding and Donors</Link></li>
		<li><Link href="/roadmap">Roadmap</Link></li>
		<li><Link href="/press">Press</Link></li>
		<li><Link href="/vacancies">Vacancies</Link></li>
	</ul>
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
		grid-template-columns: 1fr;
		align-items: start;
	}

	@media (min-width: 768px) {
		.people {
			grid-template-columns: 1fr 1fr;
			gap: 2rem 1rem;
		}
	}

	.essential-info {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 2px solid #ccc;
	}

	.essential-info h2 {
		font-size: 2rem;
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.essential-info-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.75rem;
	}

	.essential-info-list li {
		margin: 0;
	}

	.essential-info-list :global(a) {
		color: var(--brand-subtle);
		text-decoration: underline;
	}

	.essential-info-list :global(a:hover) {
		color: var(--brand);
	}

	@media (min-width: 768px) {
		.essential-info-list {
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
		}
	}
</style>
