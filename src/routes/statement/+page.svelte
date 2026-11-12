<script lang="ts">
	import PostMeta from '#lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import Signatory from './signatory.svelte'
	import StatementForm from './StatementForm.svelte'
	import type { PageData } from './$types'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	const { signatories, totalCount } = $derived(data)
	const { title, description, date } = meta

	// Variable to control how many signatories are shown
	const shortListN = 5
	let showAll = $state(false)
	let expandAllBios = $state(false)
	// Reactive variable to determine the list of signatories to display
	let visibleSignatories = $derived(showAll ? signatories : signatories.slice(0, shortListN))
	// Function to toggle between limited and full list and bios
	function toggleShowAll() {
		showAll = !showAll
		expandAllBios = showAll
	}

	// Milestone goals for signatures
	const milestones = [2000, 2500, 3000, 4000, 5000, 10000, 15000, 20000, 25000, 30000]
	// Find the next milestone goal
	const nextGoal = milestones.find((goal) => totalCount < goal) ?? milestones[milestones.length - 1]
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<p class="intro">
	This statement summarizes what PauseAI volunteers and supporters are seeking via the PauseAI
	Campaign. Sign below to add your voice to our number and build our collective strength.
</p>

<blockquote class="statement">
	We call on the governments of the world to sign an international treaty implementing a pause on
	the training of the most powerful general AI systems, until we know how to build them safely and
	keep them under democratic control.
</blockquote>

<StatementForm>
	{#snippet counter()}
		<p class="counter">
			<strong>{totalCount.toLocaleString('en-US')} signatures.</strong> Help us reach {nextGoal.toLocaleString(
				'en-US'
			)}.
		</p>
	{/snippet}
</StatementForm>

<div class="signatories-header">
	<h2>Signatories ({totalCount.toLocaleString('en-US')})</h2>
	<button class="expand-all" onclick={toggleShowAll} aria-label="Expand all signatories and bios">
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
	<button onclick={toggleShowAll}>
		{showAll ? 'Show Less' : 'Show All Signatories'}
	</button>
</section>

<style>
	/* Style for the intro paragraph */
	.intro {
		margin: 1rem auto 1.5rem auto;
		font-size: 1.2rem;
		line-height: 1.75;
		color: var(--text);
		font-weight: 200;
		text-align: left;
		max-width: 800px;
	}

	/* Style for the statement */
	.statement {
		margin: 1.5rem 0 1rem;
		padding: 1rem 1.5rem;
		font-weight: 500;
		border-left: 4px solid var(--brand);
		border-radius: 0 24px 24px 0;
		background-color: var(--bg-subtle);
		font-size: 1.3rem;
		line-height: 1.5;
		color: var(--text);
	}

	/* Rendered inside StatementForm's card, right under its heading. */
	.counter {
		margin: -0.75rem 0 1.25rem;
		font-size: 0.95rem;
		color: var(--text);
	}
	.signatories {
		display: grid;
		gap: 1rem;
	}

	/* Matches the onboarding form's secondary button. */
	button {
		margin-top: 1rem;
		padding: 0.5rem 1.5rem;
		background: none;
		color: var(--brand);
		border: 2px solid var(--brand);
		border-radius: 50px;
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
	}

	button:hover {
		background-color: var(--bg);
	}

	.signatories-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	.expand-all {
		margin-top: 0;
		margin-left: 1rem;
		float: right;
	}
</style>
