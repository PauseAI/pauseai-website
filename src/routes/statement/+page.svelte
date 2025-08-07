<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import TallyEmbed from '$lib/components/TallyEmbed.svelte'
	import { meta } from './meta'
	import Signatory from './signatory.svelte'

	export let data

	const { signatories, totalCount } = data
	const { title, description, date } = meta

	// Variable to control how many signatories are shown
	const shortListN = 5
	let showAll = false
	let expandAllBios = false
	// Reactive variable to determine the list of signatories to display
	$: visibleSignatories = showAll ? signatories : signatories.slice(0, shortListN)
	// Function to toggle between limited and full list and bios
	function toggleShowAll() {
		showAll = !showAll
		expandAllBios = showAll
	}

	// Milestone goals for signatures
	const milestones = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500]
	// Find the next milestone goal
	const nextGoal = milestones.find((goal) => totalCount < goal) || milestones[milestones.length - 1]
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<blockquote class="statement">
	We call on the governments of the world to sign an international treaty implementing a temporary
	pause on the training of the most powerful general AI systems, until we know how to build them
	safely and keep them under democratic control.
</blockquote>

<!-- Signatories Counter and Goal -->
<div class="signatories-counter">
	<p>We've collected {totalCount} signatures so far— help us reach our first {nextGoal}!</p>
</div>

<TallyEmbed formId="315xdg" />

<div class="signatories-header">
	<h2>Signatories ({totalCount})</h2>
	<button class="expand-all" on:click={toggleShowAll} aria-label="Expand all signatories and bios">
		{showAll ? 'Collapse All' : 'Expand All'}
	</button>
</div>

<section data-pagefind-ignore>
	{#if visibleSignatories.length === 0}
		<p>No signatories found</p>
	{/if}
	<ul class="signatories">
		{#each visibleSignatories as { name, country, bio }}
			<Signatory {name} {country} {bio} {expandAllBios} />
		{/each}
	</ul>

	<!-- Button to toggle between limited and full list -->
	<button on:click={toggleShowAll}>
		{showAll ? 'Show Less' : 'Show All Signatories'}
	</button>
</section>

<style>
	/* Style for the statement */
	.statement {
		margin: 2rem 0;
		padding: 1rem;
		font-weight: normal;
		border-left: 4px solid var(--brand);
		background-color: var(--text-subtle);
		font-size: 1rem;
		line-height: 1.8;
		color: var(--text);
	}

	@media (min-width: 600px) {
		.statement {
			font-size: 1.5rem;
		}
	}

	/* Style for the signatories counter */
	.signatories-counter {
		font-family: 'Arial', sans-serif;
		margin: 2rem 0;
		text-align: center;
		font-size: 1.2rem;
		/*border: 1px solid #ccc;
		padding: 1rem;
		background-color: #fff;
		border-radius: 8px;
		color: #444;*/
	}

	.signatories-counter p {
		margin: 0;
		font-weight: bold;
	}
	.signatories {
		display: grid;
		gap: 1rem;
	}

	button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background-color: var(--brand);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: var(--brand-dark);
	}

	.signatories-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	.expand-all {
		margin-left: 1rem;
		padding: 0.4rem 1rem;
		background-color: var(--brand);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		float: right;
	}
	.expand-all:hover {
		background-color: var(--brand-dark);
	}
</style>
