<script lang="ts">
	import Cell from './TableCell.svelte'
	import { categories } from './categories'
	import { companies } from './companies'

	let showExplanation = false
</script>

<label>
	<input type="checkbox" bind:checked={showExplanation} />
	Show explanations
</label>

<table>
	<thead>
		<tr>
			<th />
			{#each categories as category (category.name)}
				<Cell title={category.name} explanation={category.explanation} {showExplanation} />
			{/each}
			<Cell title="Total" explanation="Sum of the scores" {showExplanation} />
		</tr>
	</thead>
	<tbody>
		{#each companies as company (company.name)}
			<tr class="company">
				<td class="name">{company.name}</td>
				{#each categories as category (category.name)}
					<Cell
						score={company[category.key].score}
						explanation={company[category.key].explanation}
						{showExplanation}
					/>
				{/each}
				<td class="score"
					>{company.lobby.score + company.acknowledge.score + company.deployment.score}</td
				>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		max-width: var(--page-width);
		overflow-x: auto; /* Add horizontal scrollbar if needed */
	}
	:global(td),
	:global(th) {
		padding: 0.5rem;
		text-align: left;
		vertical-align: top;
	}

	.name {
		font-weight: bold;
	}
</style>
