<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Cell from './TableCell.svelte'
	import { categories } from './categories'
	import { companies } from './companies'

	let showExplanation = false
</script>

<Button on:click={() => (showExplanation = !showExplanation)}>Toggle explanations</Button>

<table class={showExplanation ? 'table--big' : ''}>
	<thead>
		<tr>
			<th />
			{#each categories as category (category.name)}
				<Cell title={category.name} explanation={category.explanation} {showExplanation} />
			{/each}
			<Cell title="Total" explanation="Average of the scores" {showExplanation} />
		</tr>
	</thead>
	<tbody>
		{#each companies as company (company.name)}
			<tr class="company">
				<td class="name">{company.name}</td>
				{#each categories as category (category.name)}
					{#if company[category.key] === undefined}
						<td />
					{:else}
						<Cell
							score={company[category.key].score}
							explanation={company[category.key].explanation}
							{showExplanation}
						/>
					{/if}
				{/each}
				<Cell score={company.totalScore} explanation="Average of all scores." {showExplanation} />
				<!-- <td class="total">{company.totalScore}</td> -->
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		max-width: var(--page-width);
		overflow-x: auto;
		overflow: visible;
		display: block;
		/* Too much margin  */
		/* margin-left: calc(50% - var(--page-width) / 2); */
	}

	.table--big {
		margin-left: max(calc(50% - 50vw), -10rem);
	}
	:global(td),
	:global(th) {
		padding: 0.5rem;
		text-align: left;
		vertical-align: top;
	}

	.total {
		font-weight: bold;
		color: var(--brand);
		font-size: 1.2rem;
	}

	.name {
		font-weight: bold;
	}
</style>
